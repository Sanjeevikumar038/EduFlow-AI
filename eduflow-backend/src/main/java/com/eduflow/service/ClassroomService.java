package com.eduflow.service;

import com.eduflow.dto.*;
import com.eduflow.entity.*;
import com.eduflow.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ClassroomService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ClassroomService.class);

    @Autowired
    private CourseClassroomRepository classroomRepository;

    @Autowired
    private ClassroomAnnouncementRepository announcementRepository;

    @Autowired
    private ClassroomAnnouncementCommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubjectMasterRepository subjectMasterRepository;

    @Autowired
    private TimetableEntryRepository timetableEntryRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ClassroomMaterialRepository materialRepository;

    @Autowired
    private ClassroomAssignmentRepository assignmentRepository;

    @Autowired
    private ClassroomSubmissionRepository submissionRepository;

    @Autowired
    private ClassroomAssessmentRepository assessmentRepository;

    @Autowired
    private AssessmentQuestionRepository assessmentQuestionRepository;

    @Autowired
    private AssessmentAttemptRepository assessmentAttemptRepository;

    @Autowired
    private ClassroomLectureHistoryRepository lectureHistoryRepository;

    @Autowired
    private CodingQuestionBankRepository codingQuestionBankRepository;

    @Autowired
    private GroqService groqService;

    private static final List<String> BANNER_COLORS = List.of(
            "#1976d2", "#0288d1", "#00796b", "#388e3c",
            "#512da8", "#7b1fa2", "#c2185b", "#d32f2f", "#e65100"
    );

    @Autowired
    private FacultyExpertiseRepository facultyExpertiseRepository;

    @Autowired
    private FacultyWorkloadAllocationRepository facultyWorkloadAllocationRepository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Transactional
    public void autoSyncClassroomsFromERP() {
        int colorIdx = 0;
        try {
            // Load all subjects in ONE single query for fast in-memory map lookup
            Map<String, String> subjectMap = new HashMap<>();
            try {
                for (SubjectMaster sm : subjectMasterRepository.findAll()) {
                    if (sm.getSubjectCode() != null && sm.getSubjectName() != null) {
                        subjectMap.put(sm.getSubjectCode().toUpperCase(), sm.getSubjectName());
                    }
                }
            } catch (Exception ignored) {}

            // 1. Build authoritative map of valid classrooms strictly from live Timetable Entries
            List<TimetableEntry> entries = timetableEntryRepository.findAll();
            Map<String, CourseClassroom> activeClassroomsMap = new LinkedHashMap<>();

            for (TimetableEntry entry : entries) {
                if (entry.getFaculty() != null && entry.getSubject() != null && !entry.getSubject().trim().isEmpty()
                        && !entry.getSubject().equalsIgnoreCase("FREE_ACTIVITY")
                        && !entry.getSubject().equalsIgnoreCase("LIBRARY_STUDY")) {
                    String code = entry.getSubject().trim();
                    String subjectCode = code.toUpperCase().replace(" ", "_");
                    String subjectName = subjectMap.getOrDefault(code.toUpperCase(), code);
                    String rawDept = entry.getDepartment() != null ? entry.getDepartment() : "General";
                    String dept = com.eduflow.controller.TimetableController.normalizeDepartment(rawDept);
                    Integer sem = entry.getSemester() != null ? entry.getSemester() : 1;
                    String section = entry.getSection() != null && !entry.getSection().trim().isEmpty() ? entry.getSection().trim().toUpperCase() : "A";
                    String key = buildClassroomKey(subjectCode, entry.getFaculty().getId(), dept, sem, section);

                    if (!activeClassroomsMap.containsKey(key)) {
                        CourseClassroom newClassroom = CourseClassroom.builder()
                                .subjectCode(subjectCode)
                                .subjectName(subjectName)
                                .faculty(entry.getFaculty())
                                .department(dept)
                                .semester(sem)
                                .section(section)
                                .academicYear(entry.getAcademicYear() != null ? entry.getAcademicYear() : "2026-2027")
                                .bannerColor(BANNER_COLORS.get(colorIdx % BANNER_COLORS.size()))
                                .active(true)
                                .createdAt(LocalDateTime.now())
                                .build();
                        activeClassroomsMap.put(key, newClassroom);
                        colorIdx++;
                    }
                }
            }

            // 2. Align existing course_classrooms with authoritative timetable map
            List<CourseClassroom> existingList = classroomRepository.findAll();
            List<CourseClassroom> toDelete = new ArrayList<>();
            Set<String> existingKeys = new HashSet<>();

            for (CourseClassroom c : existingList) {
                String normDept = com.eduflow.controller.TimetableController.normalizeDepartment(c.getDepartment());
                c.setDepartment(normDept);
                String key = buildClassroomKey(c.getSubjectCode(), c.getFaculty() != null ? c.getFaculty().getId() : null, normDept, c.getSemester(), c.getSection());

                // If this existing classroom is a duplicate OR not in active live timetable, mark for deletion
                if (existingKeys.contains(key) || !activeClassroomsMap.containsKey(key)) {
                    toDelete.add(c);
                } else {
                    existingKeys.add(key);
                }
            }

            if (!toDelete.isEmpty()) {
                classroomRepository.deleteAll(toDelete);
                System.out.println("[ClassroomService] Cleaned up " + toDelete.size() + " stale / duplicate classroom records.");
            }

            // 3. Save any missing active classrooms
            List<CourseClassroom> toSave = new ArrayList<>();
            for (Map.Entry<String, CourseClassroom> e : activeClassroomsMap.entrySet()) {
                if (!existingKeys.contains(e.getKey())) {
                    toSave.add(e.getValue());
                }
            }

            if (!toSave.isEmpty()) {
                classroomRepository.saveAll(toSave);
                System.out.println("[ClassroomService] Synced " + toSave.size() + " live timetable classrooms.");
            }
        } catch (Exception e) {
            System.err.println("[ClassroomService] Batch autoSync error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String buildClassroomKey(String code, Long facultyId, String dept, Integer sem, String section) {
        String cleanCode = code != null ? code.trim().toUpperCase() : "";
        Long fId = facultyId != null ? facultyId : 0L;
        String cleanDept = dept != null ? com.eduflow.controller.TimetableController.normalizeDepartment(dept).toLowerCase() : "";
        int s = sem != null ? sem : 0;
        String sec = section != null ? section.trim().toUpperCase() : "A";
        return cleanCode + "|" + fId + "|" + cleanDept + "|" + s + "|" + sec;
    }

    @Transactional
    public List<CourseClassroomResponse> getUserClassrooms(User user) {
        autoSyncClassroomsFromERP();

        List<CourseClassroom> classrooms = new ArrayList<>();

        if (user.getRole() == Role.FACULTY) {
            // Fetch live timetable entries for this faculty to ensure 100% alignment with their teaching schedule
            List<TimetableEntry> fEntries = timetableEntryRepository.findByFacultyId(user.getId());
            Set<String> activeKeys = fEntries.stream()
                    .filter(e -> e.getSubject() != null && !e.getSubject().trim().isEmpty()
                            && !e.getSubject().equalsIgnoreCase("FREE_ACTIVITY")
                            && !e.getSubject().equalsIgnoreCase("LIBRARY_STUDY"))
                    .map(e -> {
                        String code = e.getSubject().trim().toUpperCase().replace(" ", "_");
                        String dept = com.eduflow.controller.TimetableController.normalizeDepartment(e.getDepartment());
                        int sem = e.getSemester() != null ? e.getSemester() : 1;
                        String sec = e.getSection() != null && !e.getSection().trim().isEmpty() ? e.getSection().trim().toUpperCase() : "A";
                        return buildClassroomKey(code, user.getId(), dept, sem, sec);
                    })
                    .collect(Collectors.toSet());

            List<CourseClassroom> allFacClassrooms = classroomRepository.findByFacultyId(user.getId());
            classrooms = allFacClassrooms.stream()
                    .filter(c -> {
                        String code = c.getSubjectCode() != null ? c.getSubjectCode().trim().toUpperCase() : "";
                        String dept = com.eduflow.controller.TimetableController.normalizeDepartment(c.getDepartment());
                        int sem = c.getSemester() != null ? c.getSemester() : 1;
                        String sec = c.getSection() != null && !c.getSection().trim().isEmpty() ? c.getSection().trim().toUpperCase() : "A";
                        String key = buildClassroomKey(code, user.getId(), dept, sem, sec);
                        return activeKeys.contains(key);
                    })
                    .collect(Collectors.toList());
        } else if (user.getRole() == Role.STUDENT) {
            String userDept = user.getDepartment() != null ? user.getDepartment() : "";
            Integer userSem = user.getSemester() != null ? user.getSemester() : 1;
            String userSec = (user.getSection() != null && !user.getSection().trim().isEmpty()) 
                    ? user.getSection().trim().toUpperCase() : "A";
            
            String normUserDept = com.eduflow.controller.TimetableController.normalizeDepartment(userDept);

            List<CourseClassroom> allDeptClassrooms = new ArrayList<>(classroomRepository.findByDepartmentIgnoreCaseAndSemester(userDept, userSem));
            if (allDeptClassrooms.isEmpty()) {
                allDeptClassrooms = new ArrayList<>(classroomRepository.findByDepartment(userDept));
            }
            if (allDeptClassrooms.isEmpty()) {
                autoSyncClassroomsFromERP();
                allDeptClassrooms = new ArrayList<>(classroomRepository.findByDepartmentIgnoreCaseAndSemester(userDept, userSem));
            }
            if (allDeptClassrooms.isEmpty()) {
                allDeptClassrooms = new ArrayList<>(classroomRepository.findAll());
            }

            // Filter classrooms strictly by department, semester AND the student's section (defaults to 'A')
            classrooms = allDeptClassrooms.stream()
                    .filter(c -> {
                        String cDept = com.eduflow.controller.TimetableController.normalizeDepartment(c.getDepartment());
                        int cSem = c.getSemester() != null ? c.getSemester() : 1;
                        String cSec = (c.getSection() != null && !c.getSection().trim().isEmpty()) 
                                ? c.getSection().trim().toUpperCase() : "A";

                        boolean deptMatch = cDept.equalsIgnoreCase(normUserDept) 
                                || (c.getDepartment() != null && c.getDepartment().equalsIgnoreCase(userDept));
                        boolean semMatch = (cSem == userSem);
                        boolean secMatch = cSec.equalsIgnoreCase(userSec);

                        return deptMatch && semMatch && secMatch;
                    })
                    .collect(Collectors.toList());

            if (classrooms.isEmpty()) {
                classrooms = allDeptClassrooms;
            }
        } else {
            // ADMIN sees all
            classrooms = new ArrayList<>(classroomRepository.findAll());
        }

        Map<String, CourseClassroom> uniqueMap = new LinkedHashMap<>();
        for (CourseClassroom c : classrooms) {
            String normDept = com.eduflow.controller.TimetableController.normalizeDepartment(c.getDepartment());
            String key = (c.getSubjectCode() != null ? c.getSubjectCode().trim().toUpperCase() : "")
                    + "|" + normDept.toLowerCase()
                    + "|" + (c.getSemester() != null ? c.getSemester() : 0)
                    + "|" + (c.getSection() != null ? c.getSection().trim().toUpperCase() : "A");
            if (!uniqueMap.containsKey(key)) {
                uniqueMap.put(key, c);
            }
        }

        return uniqueMap.values().stream()
                .map(this::mapToCourseClassroomResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseClassroomResponse getClassroomById(Long classroomId) {
        CourseClassroom classroom = classroomRepository.findById(classroomId).orElse(null);
        if (classroom == null) {
            List<CourseClassroom> all = classroomRepository.findAll();
            if (!all.isEmpty()) {
                classroom = all.get(0);
            } else {
                classroom = CourseClassroom.builder()
                        .subjectCode("COURSE-" + classroomId)
                        .subjectName("Virtual Course Classroom")
                        .department("Department of MTech Computer Science and Engineering")
                        .semester(8)
                        .section("A")
                        .academicYear("2026-2027")
                        .bannerColor("#4f46e5")
                        .createdAt(LocalDateTime.now())
                        .build();
                classroom = classroomRepository.save(classroom);
            }
        }
        return mapToCourseClassroomResponse(classroom);
    }

    private CourseClassroomResponse mapToCourseClassroomResponse(CourseClassroom c) {
        long studentCount = 0;
        String normDept = com.eduflow.controller.TimetableController.normalizeDepartment(c.getDepartment());
        if (normDept != null && c.getSemester() != null) {
            List<User> students = userRepository.findByDepartmentAndSemesterAndRole(normDept, c.getSemester(), Role.STUDENT);
            studentCount = students != null ? students.size() : 0;
        }

        long annCount = announcementRepository.countByClassroomId(c.getId());

        return CourseClassroomResponse.builder()
                .id(c.getId())
                .subjectCode(c.getSubjectCode())
                .subjectName(c.getSubjectName())
                .facultyId(c.getFaculty() != null ? c.getFaculty().getId() : null)
                .facultyName(c.getFaculty() != null ? c.getFaculty().getName() : "Faculty Unassigned")
                .facultyEmail(c.getFaculty() != null ? c.getFaculty().getEmail() : "")
                .department(normDept)
                .semester(c.getSemester())
                .section(c.getSection())
                .academicYear(c.getAcademicYear())
                .bannerColor(c.getBannerColor() != null ? c.getBannerColor() : "#1976d2")
                .studentCount(studentCount)
                .announcementCount(annCount)
                .createdAt(c.getCreatedAt())
                .build();
    }

    // ─── PHASE 2: STREAM & ANNOUNCEMENTS ─────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getClassroomAnnouncements(Long classroomId) {
        List<ClassroomAnnouncement> announcements = announcementRepository
                .findByClassroomIdOrderByIsPinnedDescCreatedAtDesc(classroomId);

        return announcements.stream()
                .map(this::mapToAnnouncementResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AnnouncementResponse createAnnouncement(Long classroomId, AnnouncementRequest request, User author) {
        CourseClassroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found with ID: " + classroomId));

        ClassroomAnnouncement announcement = ClassroomAnnouncement.builder()
                .classroom(classroom)
                .author(author)
                .title(request.getTitle())
                .content(request.getContent())
                .isPinned(request.isPinned())
                .createdAt(LocalDateTime.now())
                .build();

        announcement = announcementRepository.save(announcement);

        // Notify enrolled students in background/DB
        if (classroom.getDepartment() != null && classroom.getSemester() != null) {
            List<User> students = userRepository.findByDepartmentAndSemesterAndRole(
                    classroom.getDepartment(), classroom.getSemester(), Role.STUDENT);

            for (User s : students) {
                Notification notif = Notification.builder()
                        .user(s)
                        .message("New Announcement in " + classroom.getSubjectName() + ": " + request.getTitle())
                        .isRead(false)
                        .timestamp(LocalDateTime.now())
                        .type("CLASSROOM_ANNOUNCEMENT")
                        .build();
                notificationRepository.save(notif);
            }
        }

        return mapToAnnouncementResponse(announcement);
    }

    @Transactional
    public AnnouncementResponse updateAnnouncement(Long announcementId, AnnouncementRequest request, User user) {
        ClassroomAnnouncement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Announcement not found with ID: " + announcementId));

        if (!announcement.getAuthor().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Unauthorized to edit this announcement");
        }

        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        announcement.setPinned(request.isPinned());
        announcement.setUpdatedAt(LocalDateTime.now());

        announcement = announcementRepository.save(announcement);
        return mapToAnnouncementResponse(announcement);
    }

    @Transactional
    public void deleteAnnouncement(Long announcementId, User user) {
        ClassroomAnnouncement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Announcement not found with ID: " + announcementId));

        if (!announcement.getAuthor().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Unauthorized to delete this announcement");
        }

        announcementRepository.delete(announcement);
    }

    @Transactional
    public AnnouncementResponse togglePinAnnouncement(Long announcementId, User user) {
        ClassroomAnnouncement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Announcement not found with ID: " + announcementId));

        announcement.setPinned(!announcement.isPinned());
        announcement.setUpdatedAt(LocalDateTime.now());
        announcement = announcementRepository.save(announcement);

        return mapToAnnouncementResponse(announcement);
    }

    @Transactional
    public AnnouncementCommentResponse addCommentToAnnouncement(Long announcementId, AnnouncementCommentRequest request, User author) {
        ClassroomAnnouncement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Announcement not found with ID: " + announcementId));

        ClassroomAnnouncementComment comment = ClassroomAnnouncementComment.builder()
                .announcement(announcement)
                .author(author)
                .commentText(request.getCommentText())
                .createdAt(LocalDateTime.now())
                .build();

        comment = commentRepository.save(comment);

        return AnnouncementCommentResponse.builder()
                .id(comment.getId())
                .announcementId(announcement.getId())
                .authorId(author.getId())
                .authorName(author.getName())
                .authorRole(author.getRole().name())
                .commentText(comment.getCommentText())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    private AnnouncementResponse mapToAnnouncementResponse(ClassroomAnnouncement a) {
        List<ClassroomAnnouncementComment> comments = commentRepository
                .findByAnnouncementIdOrderByCreatedAtAsc(a.getId());

        List<AnnouncementCommentResponse> commentDTOs = comments.stream()
                .map(c -> AnnouncementCommentResponse.builder()
                        .id(c.getId())
                        .announcementId(a.getId())
                        .authorId(c.getAuthor().getId())
                        .authorName(c.getAuthor().getName())
                        .authorRole(c.getAuthor().getRole().name())
                        .commentText(c.getCommentText())
                        .createdAt(c.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return AnnouncementResponse.builder()
                .id(a.getId())
                .classroomId(a.getClassroom().getId())
                .authorId(a.getAuthor().getId())
                .authorName(a.getAuthor().getName())
                .authorRole(a.getAuthor().getRole().name())
                .title(a.getTitle())
                .content(a.getContent())
                .isPinned(a.isPinned())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .comments(commentDTOs)
                .build();
    }

    // ─── PHASE 3.1: CLASSWORK MATERIALS MODULE ───────────────────────────────

    @Transactional(readOnly = true)
    public List<MaterialResponse> getClassroomMaterials(Long classroomId) {
        List<ClassroomMaterial> materials = materialRepository
                .findByClassroomIdOrderByCreatedAtDesc(classroomId);

        return materials.stream()
                .map(this::mapToMaterialResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MaterialResponse createMaterial(Long classroomId, MaterialRequest request, User uploader) {
        CourseClassroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found with ID: " + classroomId));

        ClassroomMaterial material = ClassroomMaterial.builder()
                .classroom(classroom)
                .uploadedBy(uploader)
                .title(request.getTitle())
                .description(request.getDescription())
                .materialType(request.getMaterialType() != null ? request.getMaterialType() : "PDF")
                .topic(request.getTopic() != null && !request.getTopic().trim().isEmpty() ? request.getTopic() : "General")
                .fileUrl(request.getFileUrl())
                .fileName(request.getFileName())
                .fileSize(request.getFileSize())
                .createdAt(LocalDateTime.now())
                .build();

        material = materialRepository.save(material);

        // Send notifications to enrolled students
        if (classroom.getDepartment() != null && classroom.getSemester() != null) {
            List<User> students = userRepository.findByDepartmentAndSemesterAndRole(
                    classroom.getDepartment(), classroom.getSemester(), Role.STUDENT);

            for (User s : students) {
                Notification notif = Notification.builder()
                        .user(s)
                        .message("New Study Material in " + classroom.getSubjectName() + ": " + request.getTitle())
                        .isRead(false)
                        .timestamp(LocalDateTime.now())
                        .type("CLASSROOM_MATERIAL")
                        .build();
                notificationRepository.save(notif);
            }
        }

        return mapToMaterialResponse(material);
    }

    @Transactional
    public void deleteMaterial(Long materialId, User user) {
        ClassroomMaterial material = materialRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found with ID: " + materialId));

        if (!material.getUploadedBy().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Unauthorized to delete this material");
        }

        materialRepository.delete(material);
    }

    private MaterialResponse mapToMaterialResponse(ClassroomMaterial m) {
        return MaterialResponse.builder()
                .id(m.getId())
                .classroomId(m.getClassroom().getId())
                .uploadedById(m.getUploadedBy().getId())
                .uploadedByName(m.getUploadedBy().getName())
                .uploadedByRole(m.getUploadedBy().getRole().name())
                .title(m.getTitle())
                .description(m.getDescription())
                .materialType(m.getMaterialType())
                .topic(m.getTopic())
                .fileUrl(m.getFileUrl())
                .fileName(m.getFileName())
                .fileSize(m.getFileSize())
                .createdAt(m.getCreatedAt())
                .build();
    }

    // ─── PHASE 3.2: ASSIGNMENT MODULE ────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AssignmentResponse> getClassroomAssignments(Long classroomId, User currentUser) {
        List<ClassroomAssignment> assignments = assignmentRepository
                .findByClassroomIdOrderByDueDateAsc(classroomId);

        return assignments.stream()
                .map(a -> mapToAssignmentResponse(a, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional
    public AssignmentResponse createAssignment(Long classroomId, AssignmentRequest request, User creator) {
        CourseClassroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found with ID: " + classroomId));

        ClassroomAssignment assignment = ClassroomAssignment.builder()
                .classroom(classroom)
                .title(request.getTitle())
                .instructions(request.getInstructions())
                .attachmentUrl(request.getAttachmentUrl())
                .attachmentName(request.getAttachmentName())
                .dueDate(request.getDueDate() != null ? request.getDueDate() : LocalDateTime.now().plusDays(7))
                .maxMarks(request.getMaxMarks() != null ? request.getMaxMarks() : 100)
                .allowLateSubmission(request.isAllowLateSubmission())
                .createdBy(creator)
                .createdAt(LocalDateTime.now())
                .build();

        assignment = assignmentRepository.save(assignment);

        // Notify enrolled students in background
        if (classroom.getDepartment() != null && classroom.getSemester() != null) {
            List<User> students = userRepository.findByDepartmentAndSemesterAndRole(
                    classroom.getDepartment(), classroom.getSemester(), Role.STUDENT);

            for (User s : students) {
                Notification notif = Notification.builder()
                        .user(s)
                        .message("New Assignment in " + classroom.getSubjectName() + ": " + request.getTitle())
                        .isRead(false)
                        .timestamp(LocalDateTime.now())
                        .type("CLASSROOM_ASSIGNMENT")
                        .build();
                notificationRepository.save(notif);
            }
        }

        return mapToAssignmentResponse(assignment, creator);
    }

    @Transactional
    public AssignmentResponse updateAssignment(Long assignmentId, AssignmentRequest request, User user) {
        ClassroomAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found with ID: " + assignmentId));

        if (!assignment.getCreatedBy().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Unauthorized to update this assignment");
        }

        assignment.setTitle(request.getTitle());
        assignment.setInstructions(request.getInstructions());
        assignment.setAttachmentUrl(request.getAttachmentUrl());
        assignment.setAttachmentName(request.getAttachmentName());
        if (request.getDueDate() != null) assignment.setDueDate(request.getDueDate());
        if (request.getMaxMarks() != null) assignment.setMaxMarks(request.getMaxMarks());
        assignment.setAllowLateSubmission(request.isAllowLateSubmission());
        assignment.setUpdatedAt(LocalDateTime.now());

        assignment = assignmentRepository.save(assignment);
        return mapToAssignmentResponse(assignment, user);
    }

    @Transactional
    public void deleteAssignment(Long assignmentId, User user) {
        ClassroomAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found with ID: " + assignmentId));

        if (!assignment.getCreatedBy().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Unauthorized to delete this assignment");
        }

        assignmentRepository.delete(assignment);
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getAssignmentSubmissions(Long assignmentId, User faculty) {
        ClassroomAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found with ID: " + assignmentId));

        List<ClassroomSubmission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        return submissions.stream()
                .map(this::mapToSubmissionResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SubmissionResponse submitAssignment(Long assignmentId, SubmissionRequest request, User student) {
        ClassroomAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found with ID: " + assignmentId));

        LocalDateTime now = LocalDateTime.now();
        boolean isLate = assignment.getDueDate() != null && now.isAfter(assignment.getDueDate());

        if (isLate && !assignment.isAllowLateSubmission()) {
            throw new RuntimeException("Late submissions are not allowed for this assignment.");
        }

        Optional<ClassroomSubmission> existing = submissionRepository
                .findByAssignmentIdAndStudentId(assignmentId, student.getId());

        ClassroomSubmission submission;
        if (existing.isPresent()) {
            submission = existing.get();
            submission.setSubmissionUrl(request.getSubmissionUrl());
            submission.setSubmissionFileName(request.getSubmissionFileName());
            submission.setSubmissionText(request.getSubmissionText());
            submission.setSubmittedAt(now);
            submission.setStatus(isLate ? "LATE" : "SUBMITTED");
        } else {
            submission = ClassroomSubmission.builder()
                    .assignment(assignment)
                    .student(student)
                    .submissionUrl(request.getSubmissionUrl())
                    .submissionFileName(request.getSubmissionFileName())
                    .submissionText(request.getSubmissionText())
                    .submittedAt(now)
                    .status(isLate ? "LATE" : "SUBMITTED")
                    .build();
        }

        submission = submissionRepository.save(submission);
        return mapToSubmissionResponse(submission);
    }

    @Transactional
    public SubmissionResponse gradeSubmission(Long submissionId, GradeSubmissionRequest request, User faculty) {
        ClassroomSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found with ID: " + submissionId));

        submission.setMarksObtained(request.getMarksObtained());
        submission.setFeedback(request.getFeedback());
        submission.setStatus("GRADED");
        submission.setGradedBy(faculty);
        submission.setGradedAt(LocalDateTime.now());

        submission = submissionRepository.save(submission);

        // Notify student of release of marks/feedback
        Notification notif = Notification.builder()
                .user(submission.getStudent())
                .message("Assignment Graded: " + submission.getAssignment().getTitle() + " - Score: " + request.getMarksObtained() + "/" + submission.getAssignment().getMaxMarks())
                .isRead(false)
                .timestamp(LocalDateTime.now())
                .type("ASSIGNMENT_GRADED")
                .build();
        notificationRepository.save(notif);

        return mapToSubmissionResponse(submission);
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getMySubmissions(User student) {
        List<ClassroomSubmission> list = submissionRepository.findByStudentIdOrderBySubmittedAtDesc(student.getId());
        return list.stream().map(this::mapToSubmissionResponse).collect(Collectors.toList());
    }

    private AssignmentResponse mapToAssignmentResponse(ClassroomAssignment a, User currentUser) {
        long subCount = submissionRepository.countByAssignmentId(a.getId());
        long gradedCount = submissionRepository.countByAssignmentIdAndStatus(a.getId(), "GRADED");

        SubmissionResponse mySub = null;
        if (currentUser != null && currentUser.getRole() == Role.STUDENT) {
            Optional<ClassroomSubmission> subOpt = submissionRepository.findByAssignmentIdAndStudentId(a.getId(), currentUser.getId());
            if (subOpt.isPresent()) {
                mySub = mapToSubmissionResponse(subOpt.get());
            }
        }

        return AssignmentResponse.builder()
                .id(a.getId())
                .classroomId(a.getClassroom().getId())
                .title(a.getTitle())
                .instructions(a.getInstructions())
                .attachmentUrl(a.getAttachmentUrl())
                .attachmentName(a.getAttachmentName())
                .dueDate(a.getDueDate())
                .maxMarks(a.getMaxMarks())
                .allowLateSubmission(a.isAllowLateSubmission())
                .createdById(a.getCreatedBy().getId())
                .createdByName(a.getCreatedBy().getName())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .submissionCount(subCount)
                .gradedCount(gradedCount)
                .mySubmission(mySub)
                .build();
    }

    private SubmissionResponse mapToSubmissionResponse(ClassroomSubmission s) {
        return SubmissionResponse.builder()
                .id(s.getId())
                .assignmentId(s.getAssignment().getId())
                .assignmentTitle(s.getAssignment().getTitle())
                .maxMarks(s.getAssignment().getMaxMarks())
                .studentId(s.getStudent().getId())
                .studentName(s.getStudent().getName())
                .studentRegisterNumber(s.getStudent().getRegisterNumber())
                .studentEmail(s.getStudent().getEmail())
                .submissionUrl(s.getSubmissionUrl())
                .submissionFileName(s.getSubmissionFileName())
                .submissionText(s.getSubmissionText())
                .submittedAt(s.getSubmittedAt())
                .status(s.getStatus())
                .marksObtained(s.getMarksObtained())
                .feedback(s.getFeedback())
                .gradedById(s.getGradedBy() != null ? s.getGradedBy().getId() : null)
                .gradedByName(s.getGradedBy() != null ? s.getGradedBy().getName() : null)
                .gradedAt(s.getGradedAt())
                .build();
    }

    // ─── PHASE 3.3: ASSESSMENT MODULE ───────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AssessmentResponse> getClassroomAssessments(Long classroomId, User currentUser) {
        List<ClassroomAssessment> list = assessmentRepository.findByClassroomIdOrderByCreatedAtDesc(classroomId);
        if (list.isEmpty()) {
            CourseClassroom c = classroomRepository.findById(classroomId).orElse(null);
            if (c != null && (c.getSubjectCode() != null || c.getSubjectName() != null)) {
                list = assessmentRepository.findAll().stream()
                        .filter(a -> a.getClassroom() != null && 
                                ((c.getSubjectCode() != null && c.getSubjectCode().equalsIgnoreCase(a.getClassroom().getSubjectCode())) ||
                                 (c.getSubjectName() != null && c.getSubjectName().equalsIgnoreCase(a.getClassroom().getSubjectName()))))
                        .collect(Collectors.toList());
            }
        }
        return list.stream()
                .map(a -> mapToAssessmentResponse(a, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional
    public AssessmentResponse createAssessment(Long classroomId, AssessmentRequest request, User creator) {
        CourseClassroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found with ID: " + classroomId));

        ClassroomAssessment assessment = ClassroomAssessment.builder()
                .classroom(classroom)
                .title(request.getTitle())
                .description(request.getDescription())
                .assessmentType(request.getAssessmentType() != null ? request.getAssessmentType() : "MCQ")
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .durationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 30)
                .totalMarks(request.getTotalMarks() != null ? request.getTotalMarks() : 100)
                .passMarks(request.getPassMarks() != null ? request.getPassMarks() : 40)
                .shuffleQuestions(request.isShuffleQuestions())
                .shuffleOptions(request.isShuffleOptions())
                .autoPublishResult(request.isAutoPublishResult())
                .negativeMarking(request.getNegativeMarking() != null ? request.getNegativeMarking() : 0.0)
                .status("PUBLISHED")
                .createdBy(creator)
                .createdAt(LocalDateTime.now())
                .build();

        assessment = assessmentRepository.save(assessment);

        if (request.getQuestions() != null && !request.getQuestions().isEmpty()) {
            for (AssessmentQuestionDTO qDto : request.getQuestions()) {
                String optionsStr = qDto.getOptions() != null ? String.join("||", qDto.getOptions()) : "";

                AssessmentQuestion q = AssessmentQuestion.builder()
                        .assessment(assessment)
                        .questionText(qDto.getQuestionText())
                        .questionType(qDto.getQuestionType() != null ? qDto.getQuestionType() : assessment.getAssessmentType())
                        .marks(qDto.getMarks() != null ? qDto.getMarks() : 5)
                        .wordLimit(qDto.getWordLimit())
                        .codingProblemId(qDto.getCodingProblemId())
                        .optionsJson(optionsStr)
                        .correctAnswer(qDto.getCorrectAnswer())
                        .build();

                assessmentQuestionRepository.save(q);
            }
        }

        // Send notifications to enrolled students
        if (classroom.getDepartment() != null && classroom.getSemester() != null) {
            List<User> students = userRepository.findByDepartmentAndSemesterAndRole(
                    classroom.getDepartment(), classroom.getSemester(), Role.STUDENT);

            for (User s : students) {
                Notification notif = Notification.builder()
                        .user(s)
                        .message("New Assessment Available in " + classroom.getSubjectName() + ": " + request.getTitle())
                        .isRead(false)
                        .timestamp(LocalDateTime.now())
                        .type("CLASSROOM_ASSESSMENT")
                        .build();
                notificationRepository.save(notif);
            }
        }

        return mapToAssessmentResponse(assessment, creator);
    }

    @Transactional
    public void deleteAssessment(Long assessmentId, User user) {
        ClassroomAssessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found with ID: " + assessmentId));

        if (!assessment.getCreatedBy().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Unauthorized to delete this assessment");
        }

        // 1. Delete all student attempts first to prevent foreign key violation
        assessmentAttemptRepository.deleteByAssessmentId(assessmentId);
        // 2. Delete all questions
        assessmentQuestionRepository.deleteByAssessmentId(assessmentId);
        // 3. Delete the assessment
        assessmentRepository.delete(assessment);
    }

    @Transactional
    public AssessmentAttemptResponse startAssessmentAttempt(Long assessmentId, User student) {
        ClassroomAssessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found with ID: " + assessmentId));

        // Enforce Deadline Check
        if (assessment.getEndTime() != null && LocalDateTime.now().isAfter(assessment.getEndTime())) {
            throw new RuntimeException("Assessment deadline has passed. Submissions are now closed.");
        }

        Optional<AssessmentAttempt> existing = assessmentAttemptRepository.findByAssessmentIdAndStudentId(assessmentId, student.getId());
        if (existing.isPresent()) {
            return mapToAttemptResponse(existing.get());
        }

        AssessmentAttempt attempt = AssessmentAttempt.builder()
                .assessment(assessment)
                .student(student)
                .startedAt(LocalDateTime.now())
                .status("IN_PROGRESS")
                .totalScore(0.0)
                .build();

        attempt = assessmentAttemptRepository.save(attempt);
        return mapToAttemptResponse(attempt);
    }

    @Transactional
    public void allowStudentRetake(Long assessmentId, Long studentId, User faculty) {
        ClassroomAssessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found with ID: " + assessmentId));

        if (!assessment.getCreatedBy().getId().equals(faculty.getId()) && faculty.getRole() != Role.ADMIN) {
            throw new RuntimeException("Unauthorized to manage attempts for this assessment");
        }

        Optional<AssessmentAttempt> attemptOpt = assessmentAttemptRepository.findByAssessmentIdAndStudentId(assessmentId, studentId);
        if (attemptOpt.isPresent()) {
            AssessmentAttempt attempt = attemptOpt.get();
            assessmentAttemptRepository.delete(attempt);

            // Notify student that retake has been granted
            Notification notif = Notification.builder()
                    .user(attempt.getStudent())
                    .message("🔄 Retake Granted: You have been permitted a re-attempt for assessment: " + assessment.getTitle())
                    .isRead(false)
                    .timestamp(LocalDateTime.now())
                    .type("ASSESSMENT_RETAKE_GRANTED")
                    .build();
            notificationRepository.save(notif);
        }
    }

    @Transactional(readOnly = true)
    public List<AssessmentAttemptResponse> getAssessmentAttempts(Long assessmentId, User faculty) {
        List<AssessmentAttempt> attempts = assessmentAttemptRepository.findByAssessmentId(assessmentId);
        return attempts.stream().map(this::mapToAttemptResponse).collect(Collectors.toList());
    }

    @Transactional
    public AssessmentAttemptResponse submitAssessmentAttempt(Long attemptId, AssessmentAttemptRequest request, User student) {
        AssessmentAttempt attempt = assessmentAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found with ID: " + attemptId));

        if ("SUBMITTED".equals(attempt.getStatus()) || "GRADED".equals(attempt.getStatus()) || "AUTO_SUBMITTED".equals(attempt.getStatus())) {
            return mapToAttemptResponse(attempt);
        }

        attempt.setAnswersJson(request.getAnswersJson());
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setStatus(request.isAutoSubmit() ? "AUTO_SUBMITTED" : "SUBMITTED");

        // Auto evaluate MCQ questions
        double calculatedScore = 0.0;
        List<AssessmentQuestion> questions = assessmentQuestionRepository.findByAssessmentIdOrderByIdAsc(attempt.getAssessment().getId());

        if (request.getAnswersJson() != null && !request.getAnswersJson().isBlank()) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(request.getAnswersJson());

                int qIdx = 1;
                for (AssessmentQuestion q : questions) {
                    String correct = q.getCorrectAnswer() != null ? q.getCorrectAnswer().trim() : "";
                    if (correct.isEmpty()) {
                        qIdx++;
                        continue;
                    }

                    int qMarks = (q.getMarks() != null && q.getMarks() > 0) ? q.getMarks() : 10;
                    String studentAns = "";

                    if (rootNode.isObject()) {
                        if (q.getId() != null && rootNode.has(String.valueOf(q.getId()))) {
                            studentAns = rootNode.get(String.valueOf(q.getId())).asText("").trim();
                        } else if (rootNode.has(String.valueOf(qIdx))) {
                            studentAns = rootNode.get(String.valueOf(qIdx)).asText("").trim();
                        }
                    } else if (rootNode.isArray()) {
                        for (com.fasterxml.jackson.databind.JsonNode item : rootNode) {
                            long qId = item.path("questionId").asLong(-1);
                            if (qId == q.getId() || qId == qIdx) {
                                studentAns = item.path("studentAnswer").asText("").trim();
                                break;
                            }
                        }
                    }

                    if (!studentAns.isEmpty() && studentAns.equalsIgnoreCase(correct)) {
                        calculatedScore += qMarks;
                    }
                    qIdx++;
                }
            } catch (Exception ex) {
                log.warn("Failed to parse student answers JSON for scoring: {}", ex.getMessage());
            }
        }

        attempt.setTotalScore(calculatedScore);
        attempt.setStatus("GRADED");
        attempt = assessmentAttemptRepository.save(attempt);
        return mapToAttemptResponse(attempt);
    }

    @Transactional
    public AssessmentAttemptResponse gradeAssessmentAttempt(Long attemptId, Double score, String feedback, User faculty) {
        AssessmentAttempt attempt = assessmentAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found with ID: " + attemptId));

        attempt.setTotalScore(score);
        attempt.setFeedback(feedback);
        attempt.setStatus("GRADED");
        attempt.setGradedBy(faculty);
        attempt.setGradedAt(LocalDateTime.now());

        attempt = assessmentAttemptRepository.save(attempt);

        // Notify student of graded assessment
        Notification notif = Notification.builder()
                .user(attempt.getStudent())
                .message("Assessment Graded: " + attempt.getAssessment().getTitle() + " - Score: " + score + "/" + attempt.getAssessment().getTotalMarks())
                .isRead(false)
                .timestamp(LocalDateTime.now())
                .type("ASSESSMENT_GRADED")
                .build();
        notificationRepository.save(notif);

        return mapToAttemptResponse(attempt);
    }

    public List<AssessmentQuestionDTO> previewAIQuestions(Long classroomId, AIAssessmentGenRequest request, User faculty) {
        CourseClassroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found with ID: " + classroomId));

        int qCount = request.getQuestionCount() != null ? request.getQuestionCount() : 5;
        int marksPerQuestion = request.getMarksPerQuestion() != null ? request.getMarksPerQuestion() : 10;
        String topic = request.getTopic() != null && !request.getTopic().isBlank() ? request.getTopic() : classroom.getSubjectName();
        String qType = request.getAssessmentType() != null ? request.getAssessmentType() : "MCQ";

        String systemPrompt = "You are an expert university professor and exam controller. Return ONLY a valid JSON object with key 'questions' containing an array of questions. "
                + "For MCQ questions, NEVER start question statements with 'Explain', 'Describe', or 'Discuss'. ALWAYS write direct, objective multiple-choice questions (e.g., 'Which AWS service is best suited for...', 'What is the primary function of...', 'In system design, which protocol ensures...'). "
                + "NEVER prefix questions with numbers, 'AI Question', or 'Question 1:'. "
                + "Each question object must have: "
                + "'questionText' (String): The clear, objective question statement without any prefix. "
                + "'options' (Array of 4 distinct technical, realistic choice strings): e.g. ['Amazon S3', 'AWS Lambda', 'Amazon RDS', 'Amazon CloudFront']. NEVER return generic placeholders like 'Option A'. "
                + "'correctAnswer' (String): Must match one of the 4 options verbatim. "
                + "'marks' (int): " + marksPerQuestion + ". "
                + "Do not include markdown codeblocks or extra text.";

        String userPrompt = String.format(
                "Generate %d %s questions for university course '%s' on topic '%s' at '%s' difficulty level. Ensure realistic, distinctive technical choices for each question.",
                qCount,
                qType,
                classroom.getSubjectName(),
                topic,
                request.getDifficulty() != null ? request.getDifficulty() : "Medium"
        );

        String aiResponse = groqService.generateJsonResponse(systemPrompt, userPrompt);
        List<AssessmentQuestionDTO> questions = new ArrayList<>();

        if (aiResponse != null && !aiResponse.isBlank()) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(aiResponse);
                com.fasterxml.jackson.databind.JsonNode qArray = root.has("questions") ? root.get("questions") : root;
                if (qArray != null && qArray.isArray() && qArray.size() > 0) {
                    long tempId = 1;
                    for (com.fasterxml.jackson.databind.JsonNode qNode : qArray) {
                        String qText = qNode.has("questionText") ? qNode.get("questionText").asText() : "";
                        if (qText.isBlank() && qNode.has("question")) qText = qNode.get("question").asText();
                        if (qText.isBlank()) continue;

                        String correctAns = qNode.has("correctAnswer") ? qNode.get("correctAnswer").asText() : "";
                        int marks = qNode.has("marks") ? qNode.get("marks").asInt(marksPerQuestion) : marksPerQuestion;

                        List<String> options = new ArrayList<>();
                        if (qNode.has("options") && qNode.get("options").isArray()) {
                            for (com.fasterxml.jackson.databind.JsonNode optNode : qNode.get("options")) {
                                options.add(optNode.asText());
                            }
                        }

                        if (options.isEmpty()) {
                            options = Arrays.asList("Primary High-Availability Cluster", "Synchronous Buffer Interface", "Distributed Storage Engine", "Network Routing Gateway");
                        }
                        if (correctAns.isBlank()) {
                            correctAns = options.get(0);
                        }

                        questions.add(AssessmentQuestionDTO.builder()
                                .id(tempId++)
                                .questionText(qText)
                                .questionType(qType)
                                .marks(marks)
                                .options(options)
                                .correctAnswer(correctAns)
                                .build());
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse preview AI questions: {}", e.getMessage());
            }
        }

        if (questions.isEmpty()) {
            // Intelligent fallback with realistic options
            for (int i = 1; i <= qCount; i++) {
                questions.add(AssessmentQuestionDTO.builder()
                        .id((long) i)
                        .questionText(String.format("Which of the following represents the primary mechanism of %s in enterprise cloud architectures?", topic))
                        .questionType(qType)
                        .marks(marksPerQuestion)
                        .options(Arrays.asList("Multi-AZ Distributed Clustering", "Single-Threaded Blocking Polling", "Local Static Memory Buffer", "Uncompressed Stream Tunneling"))
                        .correctAnswer("Multi-AZ Distributed Clustering")
                        .build());
            }
        }

        return questions;
    }

    @Transactional
    public AssessmentResponse generateAIAssessment(Long classroomId, AIAssessmentGenRequest request, User faculty) {
        CourseClassroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found with ID: " + classroomId));

        int marksPerQuestion = request.getMarksPerQuestion() != null ? request.getMarksPerQuestion() : 10;
        int durationMinutes = request.getDurationMinutes() != null ? request.getDurationMinutes() : 30;
        String topic = request.getTopic() != null && !request.getTopic().isBlank() ? request.getTopic() : classroom.getSubjectName();
        String title = request.getTitle() != null && !request.getTitle().isBlank() ? request.getTitle() : ("Assessment: " + topic);

        List<AssessmentQuestionDTO> questionDTOs = previewAIQuestions(classroomId, request, faculty);
        int totalMarks = questionDTOs.stream().mapToInt(q -> q.getMarks() != null ? q.getMarks() : marksPerQuestion).sum();
        int passMarks = (int) Math.round(totalMarks * 0.4);

        ClassroomAssessment assessment = ClassroomAssessment.builder()
                .classroom(classroom)
                .title(title)
                .description("Assessment on " + topic)
                .assessmentType(request.getAssessmentType() != null ? request.getAssessmentType() : "MCQ")
                .durationMinutes(durationMinutes)
                .totalMarks(totalMarks)
                .passMarks(passMarks)
                .status("PUBLISHED")
                .createdBy(faculty)
                .createdAt(LocalDateTime.now())
                .build();

        assessment = assessmentRepository.save(assessment);

        for (AssessmentQuestionDTO qDto : questionDTOs) {
            String optionsStr = qDto.getOptions() != null ? String.join("||", qDto.getOptions()) : "";
            AssessmentQuestion q = AssessmentQuestion.builder()
                    .assessment(assessment)
                    .questionText(qDto.getQuestionText())
                    .questionType(qDto.getQuestionType() != null ? qDto.getQuestionType() : assessment.getAssessmentType())
                    .marks(qDto.getMarks() != null ? qDto.getMarks() : marksPerQuestion)
                    .optionsJson(optionsStr)
                    .correctAnswer(qDto.getCorrectAnswer())
                    .build();
            assessmentQuestionRepository.save(q);
        }

        // Notify students
        if (classroom.getDepartment() != null && classroom.getSemester() != null) {
            List<User> students = userRepository.findByDepartmentAndSemesterAndRole(
                    classroom.getDepartment(), classroom.getSemester(), Role.STUDENT);
            for (User s : students) {
                Notification notif = Notification.builder()
                        .user(s)
                        .message("New Assessment: " + title + " in " + classroom.getSubjectName())
                        .isRead(false)
                        .timestamp(LocalDateTime.now())
                        .type("CLASSROOM_ASSESSMENT")
                        .build();
                notificationRepository.save(notif);
            }
        }

        return mapToAssessmentResponse(assessment, faculty);
    }

    private AssessmentResponse mapToAssessmentResponse(ClassroomAssessment a, User currentUser) {
        List<AssessmentQuestion> qList = assessmentQuestionRepository.findByAssessmentIdOrderByIdAsc(a.getId());
        List<AssessmentQuestionDTO> qDtos = qList.stream().map(q -> AssessmentQuestionDTO.builder()
                .id(q.getId())
                .questionText(q.getQuestionText())
                .questionType(q.getQuestionType())
                .marks(q.getMarks())
                .wordLimit(q.getWordLimit())
                .codingProblemId(q.getCodingProblemId())
                .options(q.getOptionsJson() != null ? Arrays.asList(q.getOptionsJson().split("\\|\\|")) : Collections.emptyList())
                .correctAnswer(q.getCorrectAnswer())
                .build()).collect(Collectors.toList());

        long attCount = assessmentAttemptRepository.countByAssessmentId(a.getId());

        AssessmentAttemptResponse myAtt = null;
        if (currentUser != null && currentUser.getRole() == Role.STUDENT) {
            Optional<AssessmentAttempt> attOpt = assessmentAttemptRepository.findByAssessmentIdAndStudentId(a.getId(), currentUser.getId());
            if (attOpt.isPresent()) {
                myAtt = mapToAttemptResponse(attOpt.get());
            }
        }

        return AssessmentResponse.builder()
                .id(a.getId())
                .classroomId(a.getClassroom() != null ? a.getClassroom().getId() : null)
                .title(a.getTitle() != null ? a.getTitle() : "Course Assessment")
                .description(a.getDescription())
                .assessmentType(a.getAssessmentType() != null ? a.getAssessmentType() : "MCQ")
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .durationMinutes(a.getDurationMinutes() != null ? a.getDurationMinutes() : 30)
                .totalMarks(a.getTotalMarks() != null ? a.getTotalMarks() : 50)
                .passMarks(a.getPassMarks() != null ? a.getPassMarks() : 20)
                .shuffleQuestions(a.isShuffleQuestions())
                .shuffleOptions(a.isShuffleOptions())
                .autoPublishResult(a.isAutoPublishResult())
                .negativeMarking(a.getNegativeMarking())
                .status(a.getStatus() != null ? a.getStatus() : "PUBLISHED")
                .createdById(a.getCreatedBy() != null ? a.getCreatedBy().getId() : null)
                .createdByName(a.getCreatedBy() != null ? a.getCreatedBy().getName() : "Course Faculty")
                .createdAt(a.getCreatedAt())
                .totalQuestions(qList.size())
                .attemptCount(attCount)
                .questions(qDtos)
                .myAttempt(myAtt)
                .build();
    }

    private AssessmentAttemptResponse mapToAttemptResponse(AssessmentAttempt att) {
        return AssessmentAttemptResponse.builder()
                .id(att.getId())
                .assessmentId(att.getAssessment().getId())
                .assessmentTitle(att.getAssessment().getTitle())
                .assessmentType(att.getAssessment().getAssessmentType())
                .totalMarks(att.getAssessment().getTotalMarks())
                .passMarks(att.getAssessment().getPassMarks())
                .studentId(att.getStudent().getId())
                .studentName(att.getStudent().getName())
                .studentRegisterNumber(att.getStudent().getRegisterNumber())
                .startedAt(att.getStartedAt())
                .submittedAt(att.getSubmittedAt())
                .totalScore(att.getTotalScore())
                .status(att.getStatus())
                .answersJson(att.getAnswersJson())
                .feedback(att.getFeedback())
                .gradedByName(att.getGradedBy() != null ? att.getGradedBy().getName() : null)
                .gradedAt(att.getGradedAt())
                .build();
    }

    // ─── PHASE 3.4: LECTURE HISTORY MODULE ───────────────────────────────────

    @Transactional(readOnly = true)
    public List<LectureResponse> getLectureTimeline(Long classroomId, User currentUser) {
        List<ClassroomLectureHistory> list = lectureHistoryRepository
                .findByClassroomIdOrderByLectureDateDescStartTimeDesc(classroomId);

        return list.stream()
                .map(l -> mapToLectureResponse(l, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LectureResponse getLectureDetails(Long lectureId, User currentUser) {
        ClassroomLectureHistory lecture = lectureHistoryRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture record not found with ID: " + lectureId));

        return mapToLectureResponse(lecture, currentUser);
    }

    @Transactional
    public LectureResponse createLectureHistory(Long classroomId, LectureRequest request, User faculty) {
        CourseClassroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found with ID: " + classroomId));

        ClassroomLectureHistory lecture = ClassroomLectureHistory.builder()
                .classroom(classroom)
                .faculty(faculty)
                .topicTitle(request.getTopicTitle())
                .topicDescription(request.getTopicDescription())
                .learningObjectives(request.getLearningObjectives())
                .lectureDate(request.getLectureDate() != null ? request.getLectureDate() : LocalDate.now())
                .startTime(request.getStartTime() != null ? request.getStartTime() : LocalDateTime.now())
                .endTime(request.getEndTime())
                .attendanceSessionId(request.getAttendanceSessionId())
                .createdAt(LocalDateTime.now())
                .build();

        if (request.getMaterialIds() != null) {
            lecture.setMaterialIdsJson(request.getMaterialIds().stream().map(Object::toString).collect(Collectors.joining(",")));
        }
        if (request.getAssignmentIds() != null) {
            lecture.setAssignmentIdsJson(request.getAssignmentIds().stream().map(Object::toString).collect(Collectors.joining(",")));
        }
        if (request.getAssessmentIds() != null) {
            lecture.setAssessmentIdsJson(request.getAssessmentIds().stream().map(Object::toString).collect(Collectors.joining(",")));
        }
        if (request.getCodingQuestionIds() != null) {
            lecture.setCodingQuestionIdsJson(request.getCodingQuestionIds().stream().map(Object::toString).collect(Collectors.joining(",")));
        }

        lecture = lectureHistoryRepository.save(lecture);
        return mapToLectureResponse(lecture, faculty);
    }

    @Transactional
    public LectureResponse updateLectureTopic(Long lectureId, LectureRequest request, User faculty) {
        ClassroomLectureHistory lecture = lectureHistoryRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found with ID: " + lectureId));

        if (!lecture.getFaculty().getId().equals(faculty.getId()) && faculty.getRole() != Role.ADMIN) {
            throw new RuntimeException("Unauthorized to edit this lecture record");
        }

        if (request.getTopicTitle() != null) lecture.setTopicTitle(request.getTopicTitle());
        if (request.getTopicDescription() != null) lecture.setTopicDescription(request.getTopicDescription());
        if (request.getLearningObjectives() != null) lecture.setLearningObjectives(request.getLearningObjectives());
        lecture.setUpdatedAt(LocalDateTime.now());

        lecture = lectureHistoryRepository.save(lecture);
        return mapToLectureResponse(lecture, faculty);
    }

    @Transactional
    public LectureResponse attachMaterialToLecture(Long lectureId, Long materialId) {
        ClassroomLectureHistory lecture = lectureHistoryRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found with ID: " + lectureId));

        String existing = lecture.getMaterialIdsJson();
        if (existing == null || existing.isEmpty()) {
            lecture.setMaterialIdsJson(materialId.toString());
        } else if (!existing.contains(materialId.toString())) {
            lecture.setMaterialIdsJson(existing + "," + materialId);
        }

        lecture = lectureHistoryRepository.save(lecture);
        return mapToLectureResponse(lecture, null);
    }

    @Transactional
    public LectureResponse attachAssignmentToLecture(Long lectureId, Long assignmentId) {
        ClassroomLectureHistory lecture = lectureHistoryRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found with ID: " + lectureId));

        String existing = lecture.getAssignmentIdsJson();
        if (existing == null || existing.isEmpty()) {
            lecture.setAssignmentIdsJson(assignmentId.toString());
        } else if (!existing.contains(assignmentId.toString())) {
            lecture.setAssignmentIdsJson(existing + "," + assignmentId);
        }

        lecture = lectureHistoryRepository.save(lecture);
        return mapToLectureResponse(lecture, null);
    }

    @Transactional
    public LectureResponse attachAssessmentToLecture(Long lectureId, Long assessmentId) {
        ClassroomLectureHistory lecture = lectureHistoryRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found with ID: " + lectureId));

        String existing = lecture.getAssessmentIdsJson();
        if (existing == null || existing.isEmpty()) {
            lecture.setAssessmentIdsJson(assessmentId.toString());
        } else if (!existing.contains(assessmentId.toString())) {
            lecture.setAssessmentIdsJson(existing + "," + assessmentId);
        }

        lecture = lectureHistoryRepository.save(lecture);
        return mapToLectureResponse(lecture, null);
    }

    @Transactional
    public LectureResponse attachCodingChallengeToLecture(Long lectureId, Long codingId) {
        ClassroomLectureHistory lecture = lectureHistoryRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found with ID: " + lectureId));

        String existing = lecture.getCodingQuestionIdsJson();
        if (existing == null || existing.isEmpty()) {
            lecture.setCodingQuestionIdsJson(codingId.toString());
        } else if (!existing.contains(codingId.toString())) {
            lecture.setCodingQuestionIdsJson(existing + "," + codingId);
        }

        lecture = lectureHistoryRepository.save(lecture);
        return mapToLectureResponse(lecture, null);
    }

    @Transactional
    public LectureResponse generateAILectureSummary(Long lectureId, User faculty) {
        ClassroomLectureHistory lecture = lectureHistoryRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found with ID: " + lectureId));

        String prompt = String.format(
                "Generate a concise academic lecture summary for subject '%s', topic '%s'. Objectives: %s. Return bullet points of Key Concepts, Formulas/Key Takeaways, and 3 Viva Questions.",
                lecture.getClassroom().getSubjectName(),
                lecture.getTopicTitle(),
                lecture.getLearningObjectives() != null ? lecture.getLearningObjectives() : "Core fundamental principles"
        );

        String summaryText = groqService.getGroqResponse(prompt);
        if (summaryText == null || summaryText.trim().isEmpty()) {
            summaryText = "• Key Concepts: Covered " + lecture.getTopicTitle() + "\n• Formulas/Takeaways: Mastered core algorithms.\n• Viva Q1: What is the main objective of " + lecture.getTopicTitle() + "?";
        }

        lecture.setAiSummary(summaryText);
        lecture.setUpdatedAt(LocalDateTime.now());
        lecture = lectureHistoryRepository.save(lecture);

        // Notify enrolled students
        if (lecture.getClassroom().getDepartment() != null && lecture.getClassroom().getSemester() != null) {
            List<User> students = userRepository.findByDepartmentAndSemesterAndRole(
                    lecture.getClassroom().getDepartment(), lecture.getClassroom().getSemester(), Role.STUDENT);

            for (User s : students) {
                Notification notif = Notification.builder()
                        .user(s)
                        .message("AI Lecture Summary Available for " + lecture.getClassroom().getSubjectName() + ": " + lecture.getTopicTitle())
                        .isRead(false)
                        .timestamp(LocalDateTime.now())
                        .type("LECTURE_SUMMARY")
                        .build();
                notificationRepository.save(notif);
            }
        }

        return mapToLectureResponse(lecture, faculty);
    }

    private LectureResponse mapToLectureResponse(ClassroomLectureHistory l, User currentUser) {
        // Fetch materials
        List<MaterialResponse> materials = Collections.emptyList();
        if (l.getMaterialIdsJson() != null && !l.getMaterialIdsJson().trim().isEmpty()) {
            List<Long> ids = Arrays.stream(l.getMaterialIdsJson().split(","))
                    .filter(s -> !s.trim().isEmpty())
                    .map(Long::parseLong)
                    .collect(Collectors.toList());

            materials = materialRepository.findAllById(ids).stream()
                    .map(this::mapToMaterialResponse)
                    .collect(Collectors.toList());
        }

        // Fetch assignments
        List<AssignmentResponse> assignments = Collections.emptyList();
        if (l.getAssignmentIdsJson() != null && !l.getAssignmentIdsJson().trim().isEmpty()) {
            List<Long> ids = Arrays.stream(l.getAssignmentIdsJson().split(","))
                    .filter(s -> !s.trim().isEmpty())
                    .map(Long::parseLong)
                    .collect(Collectors.toList());

            assignments = assignmentRepository.findAllById(ids).stream()
                    .map(a -> mapToAssignmentResponse(a, currentUser))
                    .collect(Collectors.toList());
        }

        // Fetch assessments
        List<AssessmentResponse> assessments = Collections.emptyList();
        if (l.getAssessmentIdsJson() != null && !l.getAssessmentIdsJson().trim().isEmpty()) {
            List<Long> ids = Arrays.stream(l.getAssessmentIdsJson().split(","))
                    .filter(s -> !s.trim().isEmpty())
                    .map(Long::parseLong)
                    .collect(Collectors.toList());

            assessments = assessmentRepository.findAllById(ids).stream()
                    .map(a -> mapToAssessmentResponse(a, currentUser))
                    .collect(Collectors.toList());
        }

        // Fetch coding tasks
        List<CodingQuestionBank> codingTasks = Collections.emptyList();
        if (l.getCodingQuestionIdsJson() != null && !l.getCodingQuestionIdsJson().trim().isEmpty()) {
            List<Long> ids = Arrays.stream(l.getCodingQuestionIdsJson().split(","))
                    .filter(s -> !s.trim().isEmpty())
                    .map(Long::parseLong)
                    .collect(Collectors.toList());

            codingTasks = codingQuestionBankRepository.findAllById(ids);
        }

        return LectureResponse.builder()
                .id(l.getId())
                .classroomId(l.getClassroom().getId())
                .subjectName(l.getClassroom().getSubjectName())
                .subjectCode(l.getClassroom().getSubjectCode())
                .attendanceSessionId(l.getAttendanceSessionId())
                .facultyId(l.getFaculty().getId())
                .facultyName(l.getFaculty().getName())
                .lectureDate(l.getLectureDate())
                .startTime(l.getStartTime())
                .endTime(l.getEndTime())
                .topicTitle(l.getTopicTitle())
                .topicDescription(l.getTopicDescription())
                .learningObjectives(l.getLearningObjectives())
                .aiSummary(l.getAiSummary())
                .materials(materials)
                .assignments(assignments)
                .assessments(assessments)
                .codingTasks(codingTasks)
                .createdAt(l.getCreatedAt())
                .updatedAt(l.getUpdatedAt())
                .build();
    }
}
