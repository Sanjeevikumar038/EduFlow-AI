package com.eduflow.controller;

import com.eduflow.dto.*;
import com.eduflow.entity.*;
import com.eduflow.repository.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private com.eduflow.service.AuthService authService;
    @Autowired private SubjectMasterRepository subjectMasterRepository;
    @Autowired private FacultyExpertiseRepository facultyExpertiseRepository;
    @Autowired private FacultyAvailabilityRepository facultyAvailabilityRepository;
    @Autowired private TimetableVersionRepository timetableVersionRepository;
    @Autowired private TimetableEntryRepository timetableEntryRepository;
    @Autowired private ClassroomRepository classroomRepository;
    @Autowired private AttendanceSessionRepository attendanceSessionRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    @Autowired private com.eduflow.service.AdminAnalyticsService adminAnalyticsService;
    @Autowired private FacultyWorkloadAllocationRepository allocationRepository;
    @Autowired private com.eduflow.service.AiWorkloadOptimizerService aiWorkloadOptimizerService;


    private void executePurgeInternal() {
        try {
            List<String> mockEmails = List.of("vimit@skcet.ac.in", "sreeraj@skcet.ac.in", "divya@skcet.ac.in", "pradeep@skcet.ac.in");
            for (String email : mockEmails) {
                Optional<User> uOpt = userRepository.findByEmail(email);
                uOpt.ifPresent(u -> deleteUserCascadedSql(u.getId()));
            }
            try { jdbcTemplate.execute("DELETE FROM course_classrooms WHERE subject_code IN ('AGAI', 'DTF', 'SE', 'DCN')"); } catch (Exception ex) {}
            try { jdbcTemplate.execute("DELETE FROM timetable_entries WHERE subject IN ('AGAI', 'DTF', 'SE', 'DCN')"); } catch (Exception ex) {}
            try { jdbcTemplate.execute("DELETE FROM subject_master WHERE subject_code IN ('AGAI', 'DTF', 'SE', 'DCN')"); } catch (Exception ex) {}

            // If zero faculty exist after purging, restore real SKCET faculty directory
            if (userRepository.findByRole(Role.FACULTY).isEmpty()) {
                String pwd = passwordEncoder.encode("123456");
                List<User> realSkcetFaculty = List.of(
                    User.builder().name("Mr VIMIT VARGHESE M").email("vimvarghesem@skcet.ac.in").password(pwd).role(Role.FACULTY).department("Department of MTech Computer Science and Engineering").active(true).build(),
                    User.builder().name("Dr. SREERAJ R").email("sreerajr@skcet.ac.in").password(pwd).role(Role.FACULTY).department("Department of MTech Computer Science and Engineering").active(true).build(),
                    User.builder().name("Dr. DIVYA P").email("divyap@skcet.ac.in").password(pwd).role(Role.FACULTY).department("Department of MTech Computer Science and Engineering").active(true).build(),
                    User.builder().name("Mr. PRADEEP KUMAR R").email("pradeepkumarr@skcet.ac.in").password(pwd).role(Role.FACULTY).department("Department of MTech Computer Science and Engineering").active(true).build(),
                    User.builder().name("Dr. MEENAKSHI S").email("meenakshis@skcet.ac.in").password(pwd).role(Role.FACULTY).department("Department of Computer Science and Engineering").active(true).build(),
                    User.builder().name("Dr. SURESH BABU K").email("sureshbabuk@skcet.ac.in").password(pwd).role(Role.FACULTY).department("Department of Computer Science and Engineering").active(true).build(),
                    User.builder().name("Dr. RAJESH K").email("rajeshk@skcet.ac.in").password(pwd).role(Role.FACULTY).department("Department of Information Technology").active(true).build()
                );
                userRepository.saveAll(realSkcetFaculty);
            }
        } catch (Exception e) {
            System.out.println("executePurgeInternal info: " + e.getMessage());
        }
    }

    @PostMapping("/purge-mock-data")
    public ResponseEntity<?> purgeMockData() {
        executePurgeInternal();
        return ResponseEntity.ok(java.util.Map.of("message", "All legacy mock faculty accounts, classrooms, and demo subjects purged from database!"));
    }

    public static String normalizeDepartment(String dept) {
        if (dept == null || dept.trim().isEmpty()) return "Department of Computer Science and Engineering";
        String trimmed = dept.trim();
        String upper = trimmed.toUpperCase();

        if (upper.contains("MTECH") || upper.contains("M.TECH") || upper.contains("M.TECH. CSE")) {
            return "Department of MTech Computer Science and Engineering";
        }
        if (upper.contains("ARTIFICIAL INTELLIGENCE") || upper.contains("AI & DATA") || upper.contains("AI & DS") || upper.equals("AIDS") || upper.contains("AI AND DATA")) {
            return "Department of Artificial Intelligence and Data Science";
        }
        if (upper.contains("BUSINESS SYSTEMS") || upper.equals("CSBS")) {
            return "Department of Computer Science and Business Systems";
        }
        if (upper.contains("CYBER") || upper.contains("AI & ML")) {
            return "Department of Computer Science and Engineering (AI & ML / Cyber Security)";
        }
        if (upper.equals("CSE") || upper.contains("COMPUTER SCIENCE")) {
            return "Department of Computer Science and Engineering";
        }
        if (upper.equals("IT") || upper.contains("INFORMATION TECH")) {
            return "Department of Information Technology";
        }
        if (upper.equals("ECE") || upper.contains("ELECTRONICS AND COMMUNICATION") || upper.contains("ELECTRONICS & COMMUNICATION")) {
            return "Department of Electronics and Communication Engineering";
        }
        if (upper.equals("EEE") || upper.contains("ELECTRICAL AND ELECTRONICS") || upper.contains("ELECTRICAL & ELECTRONICS")) {
            return "Department of Electrical and Electronics Engineering";
        }
        if (upper.equals("MECH") || upper.equals("MECHANICAL") || upper.contains("MECHANICAL ENGINEERING")) {
            return "Department of Mechanical Engineering";
        }
        if (upper.equals("MECHATRONICS") || upper.contains("MECHATRONICS ENGINEERING")) {
            return "Department of Mechatronics";
        }
        if (upper.equals("CIVIL") || upper.contains("CIVIL ENGINEERING")) {
            return "Department of Civil Engineering";
        }
        return trimmed;
    }

    // ─────────────────────────────────────────
    //  FACULTY MANAGEMENT
    // ─────────────────────────────────────────

    @PostMapping("/create-faculty")
    public ResponseEntity<?> createFaculty(@Valid @RequestBody FacultyCreateRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already registered!");
        }
        User faculty = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.FACULTY)
                .department(normalizeDepartment(request.getDepartment()))
                .build();
        userRepository.save(faculty);
        return ResponseEntity.ok("Faculty account created successfully for: " + faculty.getEmail());
    }

    @PostMapping("/bulk-create-faculty")
    public ResponseEntity<?> bulkCreateFaculty(@RequestBody List<FacultyCreateRequest> requests) {
        int created = 0;
        int updated = 0;
        int skipped = 0;
        
        java.util.Set<String> batchProcessedEmails = new java.util.HashSet<>();
        String defaultEncodedPassword = passwordEncoder.encode("123456");

        for (FacultyCreateRequest req : requests) {
            try {
                if (req.getEmail() == null || req.getEmail().trim().isEmpty()) continue;
                String cleanEmail = req.getEmail().trim().toLowerCase();
                String dept = normalizeDepartment(req.getDepartment());
                String name = req.getName() != null ? req.getName().trim() : "Faculty Member";

                if (batchProcessedEmails.contains(cleanEmail)) {
                    skipped++;
                    continue;
                }
                batchProcessedEmails.add(cleanEmail);

                Optional<User> existingOpt = userRepository.findByEmail(cleanEmail);
                if (existingOpt.isPresent()) {
                    User existing = existingOpt.get();
                    existing.setDepartment(dept);
                    if (name != null && !name.isEmpty()) existing.setName(name);
                    userRepository.save(existing);
                    updated++;
                } else {
                    String pwd = (req.getPassword() != null && !req.getPassword().trim().isEmpty() && !req.getPassword().equals("Faculty@123"))
                            ? passwordEncoder.encode(req.getPassword().trim())
                            : defaultEncodedPassword;

                    User faculty = User.builder()
                            .name(name)
                            .email(cleanEmail)
                            .password(pwd)
                            .role(Role.FACULTY)
                            .department(dept)
                            .build();

                    userRepository.save(faculty);
                    created++;
                }
            } catch (Exception e) {
                skipped++;
            }
        }

        return ResponseEntity.ok(java.util.Map.of(
            "message", "Bulk import processed successfully",
            "created", created,
            "updated", updated,
            "skipped", skipped
        ));
    }

    @GetMapping("/faculty")
    public ResponseEntity<List<User>> getAllFaculty() {
        return ResponseEntity.ok(userRepository.findByRole(Role.FACULTY));
    }

    private void deleteUserCascadedSql(Long userId) {
        if (userId == null) return;
        try { jdbcTemplate.execute("UPDATE timetable_entries SET faculty_id = NULL WHERE faculty_id = " + userId); } catch (Exception e) {}
        try { jdbcTemplate.execute("UPDATE leave_requests SET faculty_approver_id = NULL WHERE faculty_approver_id = " + userId); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM leave_requests WHERE student_id = " + userId); } catch (Exception e) {}
        
        try { jdbcTemplate.execute("DELETE FROM attendance WHERE session_id IN (SELECT id FROM attendance_sessions WHERE faculty_id = " + userId + ")"); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM attendance_sessions WHERE faculty_id = " + userId); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM attendance WHERE student_id = " + userId); } catch (Exception e) {}

        try { jdbcTemplate.execute("DELETE FROM classroom_announcement_comments WHERE author_id = " + userId); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM classroom_announcements WHERE author_id = " + userId + " OR classroom_id IN (SELECT id FROM course_classrooms WHERE faculty_id = " + userId + ")"); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM classroom_materials WHERE uploaded_by_id = " + userId + " OR classroom_id IN (SELECT id FROM course_classrooms WHERE faculty_id = " + userId + ")"); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM classroom_assignments WHERE classroom_id IN (SELECT id FROM course_classrooms WHERE faculty_id = " + userId + ")"); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM classroom_assessments WHERE classroom_id IN (SELECT id FROM course_classrooms WHERE faculty_id = " + userId + ")"); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM classroom_submissions WHERE student_id = " + userId); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM assessment_attempts WHERE student_id = " + userId); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM classroom_lecture_history WHERE faculty_id = " + userId + " OR classroom_id IN (SELECT id FROM course_classrooms WHERE faculty_id = " + userId + ")"); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM course_classrooms WHERE faculty_id = " + userId); } catch (Exception e) {}

        try { jdbcTemplate.execute("DELETE FROM faculty_availability WHERE faculty_id = " + userId); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM faculty_expertise WHERE faculty_id = " + userId); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM notifications WHERE user_id = " + userId); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM student_profiles WHERE user_id = " + userId); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM student_grade_summaries WHERE student_id = " + userId); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM student_ai_insights WHERE student_id = " + userId); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM coding_progress WHERE user_id = " + userId); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM coding_submissions WHERE user_id = " + userId); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM interview_sessions WHERE user_id = " + userId); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM interview_attempts WHERE user_id = " + userId); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM interview_results WHERE user_id = " + userId); } catch (Exception e) {}
        try { jdbcTemplate.execute("DELETE FROM resumes WHERE user_id = " + userId); } catch (Exception e) {}
        
        try { jdbcTemplate.execute("DELETE FROM users WHERE id = " + userId); } catch (Exception e) {}
    }

    @DeleteMapping("/faculty/{id}")
    @Transactional
    public ResponseEntity<?> deleteFaculty(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    if (user.getRole() != Role.FACULTY) {
                        return ResponseEntity.badRequest().body("User is not a faculty member!");
                    }
                    deleteUserCascadedSql(id);
                    return ResponseEntity.ok("Faculty deleted successfully.");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/faculty/all")
    @Transactional
    public ResponseEntity<?> deleteAllFaculty() {
        List<User> facultyList = userRepository.findByRole(Role.FACULTY);
        int deleted = 0;
        for (User u : facultyList) {
            try {
                facultyExpertiseRepository.deleteByFacultyId(u.getId());
                List<FacultyAvailability> availabilities = facultyAvailabilityRepository.findByFacultyId(u.getId());
                if (availabilities != null && !availabilities.isEmpty()) {
                    facultyAvailabilityRepository.deleteAll(availabilities);
                }
                List<TimetableEntry> entries = timetableEntryRepository.findByFacultyId(u.getId());
                if (entries != null) {
                    entries.forEach(e -> {
                        e.setFaculty(null);
                        timetableEntryRepository.save(e);
                    });
                }
                notificationRepository.deleteByUser(u);
                userRepository.delete(u);
                deleted++;
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(java.util.Map.of(
            "message", "All faculty deleted successfully",
            "deleted", deleted
        ));
    }

    // ─────────────────────────────────────────
    //  STUDENT MANAGEMENT
    // ─────────────────────────────────────────

    @Autowired private StudentProfileRepository studentProfileRepository;

    @GetMapping("/students")
    public ResponseEntity<List<User>> getAllStudents() {
        return ResponseEntity.ok(userRepository.findByRole(Role.STUDENT));
    }

    @PostMapping("/create-student")
    public ResponseEntity<?> createStudent(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already registered!");
        }
        String regNum = request.getRegisterNumber() != null && !request.getRegisterNumber().trim().isEmpty()
                ? request.getRegisterNumber().trim().toUpperCase()
                : authService.generateNextRegisterNumber(request.getDepartment());
        
        Integer sem = request.getSemester() != null ? request.getSemester() : 8;
        String sec = request.getSection() != null && !request.getSection().trim().isEmpty() ? request.getSection().trim().toUpperCase() : "A";
        String batch = request.getBatch() != null && !request.getBatch().trim().isEmpty() ? request.getBatch().trim() : "2023 - 2028";
        String calcYear = String.valueOf((sem + 1) / 2);

        User student = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .registerNumber(regNum)
                .department(normalizeDepartment(request.getDepartment()))
                .section(sec)
                .semester(sem)
                .batch(batch)
                .year(calcYear)
                .active(true)
                .build();

        userRepository.save(student);

        try {
            StudentProfile profile = StudentProfile.builder().user(student).build();
            studentProfileRepository.save(profile);
        } catch (Exception ignored) {}

        return ResponseEntity.ok("Student account created successfully!");
    }

    @PostMapping("/bulk-create-students")
    public ResponseEntity<?> bulkCreateStudents(@RequestBody List<RegisterRequest> requests) {
        int created = 0;
        int skipped = 0;

        java.util.Set<String> existingEmails = userRepository.findAll().stream()
                .map(u -> u.getEmail().toLowerCase().trim())
                .collect(java.util.stream.Collectors.toSet());
        java.util.Set<String> batchProcessedEmails = new java.util.HashSet<>();

        String defaultEncodedPassword = passwordEncoder.encode("Student@123");
        List<User> studentsToSave = new java.util.ArrayList<>();

        for (RegisterRequest req : requests) {
            try {
                if (req.getEmail() == null || req.getEmail().trim().isEmpty()) continue;
                String cleanEmail = req.getEmail().trim().toLowerCase();

                if (existingEmails.contains(cleanEmail) || batchProcessedEmails.contains(cleanEmail)) {
                    skipped++;
                    continue;
                }

                batchProcessedEmails.add(cleanEmail);
                String pwd = (req.getPassword() != null && !req.getPassword().trim().isEmpty() && !req.getPassword().equals("Student@123"))
                        ? passwordEncoder.encode(req.getPassword().trim())
                        : defaultEncodedPassword;

                String dept = normalizeDepartment(req.getDepartment());
                String regNum = authService.generateNextRegisterNumber(dept);

                User student = User.builder()
                        .name(req.getName() != null ? req.getName().trim() : "Student Member")
                        .email(cleanEmail)
                        .password(pwd)
                        .role(Role.STUDENT)
                        .registerNumber(regNum)
                        .department(dept)
                        .build();

                studentsToSave.add(student);
                created++;
            } catch (Exception e) {
                skipped++;
            }
        }

        if (!studentsToSave.isEmpty()) {
            userRepository.saveAll(studentsToSave);
        }

        return ResponseEntity.ok(java.util.Map.of(
            "message", "Bulk import processed successfully",
            "created", created,
            "skipped", skipped
        ));
    }

    @DeleteMapping("/students/{id}")
    @Transactional
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    if (user.getRole() != Role.STUDENT) {
                        return ResponseEntity.badRequest().body("User is not a student!");
                    }
                    deleteUserCascadedSql(id);
                    return ResponseEntity.ok("Student account deleted successfully!");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────
    //  SUBJECT MASTER
    // ─────────────────────────────────────────

    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectMaster>> getAllSubjects(
            @RequestParam(required = false) String department) {
        executePurgeInternal();
        if (department != null && !department.trim().isEmpty()) {
            return ResponseEntity.ok(subjectMasterRepository.findByDepartmentIgnoreCase(department));
        }
        return ResponseEntity.ok(subjectMasterRepository.findAll());
    }

    @GetMapping("/subjects/active")
    public ResponseEntity<List<SubjectMaster>> getActiveSubjects() {
        return ResponseEntity.ok(subjectMasterRepository.findByActiveTrue());
    }

    @PostMapping("/subjects")
    public ResponseEntity<?> createSubject(@RequestBody SubjectMasterRequest request) {
        try {
            if (request.getSubjectCode() == null || request.getSubjectCode().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Subject code is required");
            }
            String code = request.getSubjectCode().trim().toUpperCase();
            String name = request.getSubjectName() != null && !request.getSubjectName().trim().isEmpty() 
                          ? request.getSubjectName().trim() 
                          : "Course " + code;

            SubjectCategory category = SubjectCategory.THEORY;
            if (request.getSubjectCategory() != null) {
                String catStr = String.valueOf(request.getSubjectCategory()).toUpperCase();
                if (catStr.contains("LAB") || catStr.contains("PRACTICAL")) category = SubjectCategory.LAB;
                else if (catStr.contains("ELECTIVE")) category = SubjectCategory.ELECTIVE;
                else if (catStr.contains("PROJECT")) category = SubjectCategory.PROJECT;
                else category = SubjectCategory.THEORY;
            }

            int hrs = request.getWeeklyHours() != null && request.getWeeklyHours() > 0 ? request.getWeeklyHours() : (request.getCredits() != null ? request.getCredits() : 3);
            int sem = request.getSemester() != null && request.getSemester() > 0 ? request.getSemester() : 1;
            int cred = request.getCredits() != null ? request.getCredits() : 3;
            String dept = request.getDepartment() != null && !request.getDepartment().trim().isEmpty() ? request.getDepartment().trim() : "CSE";
            String ay = request.getAcademicYear() != null && !request.getAcademicYear().trim().isEmpty() ? request.getAcademicYear().trim() : "2024-25";

            SubjectMaster subject = SubjectMaster.builder()
                    .subjectCode(code)
                    .subjectName(name)
                    .department(dept)
                    .semester(sem)
                    .academicYear(ay)
                    .credits(cred)
                    .weeklyHours(hrs)
                    .subjectCategory(category)
                    .active(true)
                    .build();
            subjectMasterRepository.save(subject);
            return ResponseEntity.ok(subject);
        } catch (Exception ex) {
            return ResponseEntity.ok().build();
        }
    }

    @PostMapping({"/subjects/bulk", "/bulk-create-subjects"})
    public ResponseEntity<?> bulkCreateSubjects(@RequestBody List<SubjectMasterRequest> requests) {
        try {
            jdbcTemplate.execute("ALTER TABLE subject_master DROP CONSTRAINT IF EXISTS subject_master_subject_code_key");
            jdbcTemplate.execute("ALTER TABLE subject_master DROP CONSTRAINT IF EXISTS uk_subject_code");
            jdbcTemplate.execute("ALTER TABLE subject_master DROP CONSTRAINT IF EXISTS uk_subject_master_subject_code");
        } catch (Exception ignored) {}

        int created = 0;
        int skipped = 0;
        List<SubjectMaster> toSave = new java.util.ArrayList<>();
        java.util.Set<String> seenExactRowsInBatch = new java.util.HashSet<>();

        for (SubjectMasterRequest req : requests) {
            if (req.getSubjectCode() == null || req.getSubjectCode().trim().isEmpty()) {
                skipped++;
                continue;
            }
            String code = req.getSubjectCode().trim().toUpperCase();
            String name = req.getSubjectName() != null && !req.getSubjectName().trim().isEmpty() ? req.getSubjectName().trim() : "Unnamed Subject";
            String dept = req.getDepartment() != null && !req.getDepartment().trim().isEmpty() ? req.getDepartment().trim() : "CSE";
            String ay = req.getAcademicYear() != null && !req.getAcademicYear().trim().isEmpty() ? req.getAcademicYear().trim() : "2024-25";

            SubjectCategory category = SubjectCategory.THEORY;
            if (req.getSubjectCategory() != null) {
                String catStr = String.valueOf(req.getSubjectCategory()).toUpperCase();
                if (catStr.contains("LAB") || catStr.contains("PRACTICAL")) category = SubjectCategory.LAB;
                else if (catStr.contains("ELECTIVE")) category = SubjectCategory.ELECTIVE;
                else if (catStr.contains("PROJECT")) category = SubjectCategory.PROJECT;
                else category = SubjectCategory.THEORY;
            } else if (name.toLowerCase().contains("lab") || name.toLowerCase().contains("practical")) {
                category = SubjectCategory.LAB;
            }

            int hrs = req.getWeeklyHours() != null && req.getWeeklyHours() > 0 ? req.getWeeklyHours() : (req.getCredits() != null ? req.getCredits() : 3);
            int sem = req.getSemester() != null && req.getSemester() > 0 ? req.getSemester() : 1;
            int cred = req.getCredits() != null ? req.getCredits() : 3;

            // Only skip true duplicate rows within the same import file where every imported column is identical
            String exactRowKey = (code + "|" + name + "|" + dept + "|" + sem + "|" + ay + "|" + cred + "|" + hrs + "|" + category).toLowerCase();
            if (seenExactRowsInBatch.contains(exactRowKey)) {
                skipped++;
                continue;
            }
            seenExactRowsInBatch.add(exactRowKey);

            SubjectMaster subject = SubjectMaster.builder()
                    .subjectCode(code)
                    .subjectName(name)
                    .department(dept)
                    .semester(sem)
                    .academicYear(ay)
                    .credits(cred)
                    .weeklyHours(hrs)
                    .subjectCategory(category)
                    .active(true)
                    .build();
            toSave.add(subject);
        }

        for (SubjectMaster s : toSave) {
            try {
                subjectMasterRepository.save(s);
                created++;
            } catch (Exception ex) {
                skipped++;
            }
        }

        return ResponseEntity.ok(java.util.Map.of(
                "message", "Bulk subjects imported successfully",
                "created", created,
                "skipped", skipped
        ));
    }

    @PutMapping("/subjects/{id}")
    public ResponseEntity<?> updateSubject(@PathVariable Long id, @RequestBody SubjectMasterRequest request) {
        return subjectMasterRepository.findById(id).map(subject -> {
            subject.setSubjectName(request.getSubjectName());
            subject.setDepartment(request.getDepartment());
            subject.setSemester(request.getSemester());
            subject.setAcademicYear(request.getAcademicYear());
            subject.setCredits(request.getCredits());
            subject.setWeeklyHours(request.getWeeklyHours());
            if (request.getSubjectCategory() != null) {
                SubjectCategory category = SubjectCategory.THEORY;
                String catStr = String.valueOf(request.getSubjectCategory()).toUpperCase();
                if (catStr.contains("LAB") || catStr.contains("PRACTICAL")) category = SubjectCategory.LAB;
                else if (catStr.contains("ELECTIVE")) category = SubjectCategory.ELECTIVE;
                else if (catStr.contains("PROJECT")) category = SubjectCategory.PROJECT;
                else category = SubjectCategory.THEORY;
                subject.setSubjectCategory(category);
            }
            subjectMasterRepository.save(subject);
            return ResponseEntity.ok(subject);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<?> deleteSubject(@PathVariable Long id) {
        return subjectMasterRepository.findById(id).map(subject -> {
            Long sId = subject.getId();
            String code = subject.getSubjectCode();
            try {
                jdbcTemplate.execute("DELETE FROM faculty_expertise WHERE subject_id = " + sId);
                jdbcTemplate.execute("DELETE FROM timetable_entries WHERE subject = '" + code + "'");
                jdbcTemplate.execute("DELETE FROM course_classrooms WHERE subject_code = '" + code + "'");
                jdbcTemplate.execute("DELETE FROM subject_master WHERE id = " + sId);
                return ResponseEntity.ok("Subject deleted: " + code);
            } catch (Exception ex) {
                return ResponseEntity.badRequest().body("Failed to delete subject: " + ex.getMessage());
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/subjects/all")
    public ResponseEntity<?> deleteAllSubjects() {
        try {
            List<SubjectMaster> subjects = subjectMasterRepository.findAll();
            for (SubjectMaster subject : subjects) {
                Long sId = subject.getId();
                String code = subject.getSubjectCode();
                try {
                    jdbcTemplate.execute("DELETE FROM faculty_expertise WHERE subject_id = " + sId);
                    jdbcTemplate.execute("DELETE FROM timetable_entries WHERE subject = '" + code + "'");
                    jdbcTemplate.execute("DELETE FROM course_classrooms WHERE subject_code = '" + code + "'");
                    jdbcTemplate.execute("DELETE FROM subject_master WHERE id = " + sId);
                } catch (Exception ignored) {}
            }
            try { jdbcTemplate.execute("DELETE FROM faculty_expertise"); } catch (Exception ignored) {}
            try { jdbcTemplate.execute("DELETE FROM subject_master"); } catch (Exception ignored) {}
            return ResponseEntity.ok(java.util.Map.of("message", "All subjects purged successfully!"));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body("Failed to delete subjects: " + ex.getMessage());
        }
    }

    // ─────────────────────────────────────────
    //  FACULTY EXPERTISE
    // ─────────────────────────────────────────

    @GetMapping("/faculty-expertise")
    public ResponseEntity<List<FacultyExpertise>> getAllExpertise() {
        System.out.println("Entered FacultyExpertiseController");
        return ResponseEntity.ok(facultyExpertiseRepository.findAll());
    }

    @GetMapping("/faculty-expertise/faculty/{facultyId}")
    public ResponseEntity<List<FacultyExpertise>> getExpertiseByFaculty(@PathVariable Long facultyId) {
        return ResponseEntity.ok(facultyExpertiseRepository.findByFacultyId(facultyId));
    }

    @PostMapping("/faculty-expertise/allocate")
    public ResponseEntity<?> allocateExpertise(@RequestBody AllocateExpertiseRequest request) {
        Optional<User> facultyOpt = userRepository.findById(request.getFacultyId());
        Optional<SubjectMaster> subjectOpt = subjectMasterRepository.findById(request.getSubjectId());
        if (facultyOpt.isEmpty()) return ResponseEntity.badRequest().body("Faculty not found!");
        if (subjectOpt.isEmpty()) return ResponseEntity.badRequest().body("Subject not found!");

        // Upsert: update if already exists
        Optional<FacultyExpertise> existing = facultyExpertiseRepository
                .findByFacultyIdAndSubjectId(request.getFacultyId(), request.getSubjectId());

        FacultyExpertise expertise = existing.orElse(FacultyExpertise.builder()
                .faculty(facultyOpt.get())
                .subject(subjectOpt.get())
                .build());
        expertise.setExpertiseLevel(request.getExpertiseLevel());
        facultyExpertiseRepository.save(expertise);
        return ResponseEntity.ok(expertise);
    }

    @DeleteMapping("/faculty-expertise/{id}")
    public ResponseEntity<?> removeExpertise(@PathVariable Long id) {
        return facultyExpertiseRepository.findById(id).map(e -> {
            facultyExpertiseRepository.delete(e);
            return ResponseEntity.ok("Expertise allocation removed.");
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────
    //  FACULTY AVAILABILITY / LEAVES
    // ─────────────────────────────────────────

    @GetMapping("/faculty-availability")
    public ResponseEntity<List<FacultyAvailability>> getAllAvailability(
            @RequestParam(required = false) Long facultyId,
            @RequestParam(required = false) String date) {
        if (facultyId != null) {
            return ResponseEntity.ok(facultyAvailabilityRepository.findByFacultyId(facultyId));
        }
        if (date != null) {
            return ResponseEntity.ok(facultyAvailabilityRepository.findByDate(LocalDate.parse(date)));
        }
        return ResponseEntity.ok(facultyAvailabilityRepository.findAll());
    }

    @PostMapping("/faculty-availability")
    public ResponseEntity<?> setAvailability(@RequestBody FacultyAvailabilityRequest request) {
        Optional<User> facultyOpt = userRepository.findById(request.getFacultyId());
        if (facultyOpt.isEmpty()) return ResponseEntity.badRequest().body("Faculty not found!");

        // Upsert by facultyId + date
        Optional<FacultyAvailability> existing = facultyAvailabilityRepository
                .findByFacultyIdAndDate(request.getFacultyId(), request.getDate());

        FacultyAvailability availability = existing.orElse(FacultyAvailability.builder()
                .faculty(facultyOpt.get())
                .build());
        availability.setDate(request.getDate());
        availability.setAvailable(request.getAvailable() != null ? request.getAvailable() : false);
        availability.setReason(request.getReason());
        facultyAvailabilityRepository.save(availability);
        return ResponseEntity.ok(availability);
    }

    @DeleteMapping("/faculty-availability/{id}")
    public ResponseEntity<?> deleteAvailability(@PathVariable Long id) {
        return facultyAvailabilityRepository.findById(id).map(a -> {
            facultyAvailabilityRepository.delete(a);
            return ResponseEntity.ok("Availability record removed.");
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────
    //  FACULTY WORKLOAD
    // ─────────────────────────────────────────

    @GetMapping("/faculty-workload")
    public ResponseEntity<List<FacultyWorkloadDto>> getFacultyWorkload() {
        List<User> allFaculty = userRepository.findByRole(Role.FACULTY);
        int defaultMaxPeriods = 30;

        Set<Long> activeVersionIds = timetableVersionRepository.findAll().stream()
                .filter(v -> Boolean.TRUE.equals(v.isActive()))
                .map(TimetableVersion::getId)
                .collect(Collectors.toSet());

        // 1. Bulk load actual scheduled periods directly from Master Timetable entries
        List<TimetableEntry> allEntries = timetableEntryRepository.findAll();
        Map<Long, Long> activePeriodsMap = allEntries.stream()
                .filter(e -> e.getFaculty() != null && e.getFaculty().getId() != null)
                .filter(e -> e.getVersion() != null && activeVersionIds.contains(e.getVersion().getId()))
                .filter(e -> e.getSubject() == null || !e.getSubject().equalsIgnoreCase("FREE_ACTIVITY"))
                .collect(Collectors.groupingBy(e -> e.getFaculty().getId(), Collectors.counting()));

        // 2. Load approved allocations breakdown for annual vs ODD/EVEN cycle comparison
        List<FacultyWorkloadAllocation> allAllocations = allocationRepository.findAll();
        List<FacultyWorkloadAllocation> oddAllocations = allAllocations.stream()
                .filter(a -> a.getSemester() != null && a.getSemester() % 2 != 0)
                .toList();

        int totalTeachingHours = oddAllocations.stream().mapToInt(a -> a.getHoursPerWeek() != null ? a.getHoursPerWeek() : 0).sum();
        int totalFacultyCount = allFaculty.size();
        double realisticTarget = totalFacultyCount > 0 ? (double) totalTeachingHours / totalFacultyCount : 0.0;
        int configuredMin = 15;
        int maxLimit = 20;
        int requiredHours = totalFacultyCount * configuredMin;
        int shortfall = Math.max(0, requiredHours - totalTeachingHours);
        boolean isAchievable = totalTeachingHours >= requiredHours;

        String feasibilityWarning = isAchievable ? null :
                String.format("Configured minimum workload (%d hrs/wk) cannot be achieved with current teaching hours. (Achievable avg: %.1f hrs/wk, Shortfall: %d hrs).",
                        configuredMin, realisticTarget, shortfall);

        double lowerBound = Math.max(0.0, realisticTarget - 1.0);
        double upperBound = realisticTarget + 1.0;

        List<FacultyWorkloadDto> result = allFaculty.stream().map(f -> {
            long activeAllocatedHours = activePeriodsMap.getOrDefault(f.getId(), 0L);

            List<FacultyWorkloadAllocation> fAllocs = allAllocations.stream()
                    .filter(a -> a.getFaculty() != null && a.getFaculty().getId().equals(f.getId()))
                    .toList();

            int annualHours = fAllocs.stream().mapToInt(a -> a.getHoursPerWeek() != null ? a.getHoursPerWeek() : 0).sum();
            int oddHours = fAllocs.stream()
                    .filter(a -> a.getSemester() != null && a.getSemester() % 2 != 0)
                    .mapToInt(a -> a.getHoursPerWeek() != null ? a.getHoursPerWeek() : 0).sum();
            int evenHours = fAllocs.stream()
                    .filter(a -> a.getSemester() != null && a.getSemester() % 2 == 0)
                    .mapToInt(a -> a.getHoursPerWeek() != null ? a.getHoursPerWeek() : 0).sum();

            int currentLoad = (int) activeAllocatedHours;
            int diffFromRealistic = (int) Math.round(currentLoad - realisticTarget);

            double utilization = realisticTarget > 0 ? ((double) currentLoad / realisticTarget) * 100.0 : 0.0;
            String status;
            String recommendation;

            if ((double) currentLoad < lowerBound) {
                status = "UNDERLOADED";
                recommendation = String.format("Current load (%d hrs) is >1 hr below realistic target (%.1f hrs). Assign available eligible subjects.", currentLoad, realisticTarget);
            } else if ((double) currentLoad > upperBound || currentLoad > maxLimit) {
                status = "OVERLOADED";
                recommendation = String.format("Current load (%d hrs) is >1 hr above realistic target (%.1f hrs). Rebalance excess to underloaded department faculty.", currentLoad, realisticTarget);
            } else {
                status = "BALANCED";
                recommendation = String.format("Optimal teaching load achieved within 1 hr of realistic target (%.1f hrs).", realisticTarget);
            }

            return FacultyWorkloadDto.builder()
                    .facultyId(f.getId())
                    .facultyName(f.getName())
                    .department(normalizeDepartment(f.getDepartment()))
                    .allocatedPeriods(activeAllocatedHours)
                    .availablePeriods(maxLimit)
                    .approvedAnnualHours(annualHours)
                    .approvedOddCycleHours(oddHours)
                    .approvedEvenCycleHours(evenHours)
                    .activeCycle("ODD")
                    .oddSemesterTarget(configuredMin)
                    .realisticTarget(Math.round(realisticTarget * 10.0) / 10.0)
                    .isTargetAchievable(isAchievable)
                    .capacityShortfall(shortfall)
                    .feasibilityWarning(feasibilityWarning)
                    .minRequired(configuredMin)
                    .preferredRange("16-18 hrs")
                    .maxAllowed(maxLimit)
                    .difference(diffFromRealistic)
                    .recommendation(recommendation)
                    .utilizationPercentage(Math.round(utilization * 10.0) / 10.0)
                    .workloadStatus(status)
                    .build();
        }).toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/institution-capacity-report")
    public ResponseEntity<com.eduflow.dto.InstitutionCapacityReportDto> getInstitutionCapacityReport() {
        List<User> allFaculty = userRepository.findByRole(Role.FACULTY).stream()
                .filter(f -> !f.isHod()) // Exclude non-teaching HODs
                .toList();
        List<FacultyWorkloadAllocation> oddAllocations = allocationRepository.findAll().stream()
                .filter(a -> a.getSemester() != null && a.getSemester() % 2 != 0)
                .toList();

        int totalTeachingHours = oddAllocations.stream().mapToInt(a -> a.getHoursPerWeek() != null ? a.getHoursPerWeek() : 0).sum();

        // Fallback: If no draft allocations exist yet, compute from SubjectMaster for odd semesters across default 2 sections
        if (totalTeachingHours == 0) {
            List<SubjectMaster> oddSubjects = subjectMasterRepository.findAll().stream()
                    .filter(s -> s.getSemester() != null && s.getSemester() % 2 != 0)
                    .toList();
            totalTeachingHours = oddSubjects.stream().mapToInt(s -> {
                int h = s.getWeeklyHours() != null && s.getWeeklyHours() > 0 ? s.getWeeklyHours() : 4;
                return h * 2; // 2 sections per subject
            }).sum();
        }

        int totalFacultyCount = allFaculty.size();
        double avgLoad = totalFacultyCount > 0 ? (double) totalTeachingHours / totalFacultyCount : 0.0;
        int configuredMin = 15;
        int required = totalFacultyCount * configuredMin;
        int shortfall = Math.max(0, required - totalTeachingHours);
        boolean isAchievable = totalTeachingHours >= required;

        String msg = isAchievable ? "Configured minimum workload target (15 hrs/wk) is fully achievable." :
                String.format("Configured minimum workload (%d hrs/wk) cannot be achieved with current teaching hours. (Achievable avg: %.1f hrs/wk, Shortfall: %d hrs).",
                        configuredMin, avgLoad, shortfall);

        com.eduflow.dto.InstitutionCapacityReportDto report = com.eduflow.dto.InstitutionCapacityReportDto.builder()
                .totalTeachingHours(totalTeachingHours)
                .facultyCount(totalFacultyCount)
                .averageAchievableLoad(Math.round(avgLoad * 10.0) / 10.0)
                .configuredMinimum(configuredMin)
                .achievable(isAchievable)
                .requiredTeachingHours(required)
                .shortfall(shortfall)
                .feasibilityMessage(msg)
                .build();

        return ResponseEntity.ok(report);
    }

    @PostMapping("/ai-smart-workload-allocation/generate")
    public ResponseEntity<com.eduflow.dto.AiSmartAllocationResultDto> generateAiSmartWorkloadAllocation(
            @RequestBody(required = false) com.eduflow.dto.AiSmartAllocationRequest request) {
        try {
            jdbcTemplate.execute("ALTER TABLE faculty_workload_allocations DROP CONSTRAINT IF EXISTS uk1q4uutb0v2hc7r5wr4cwdidre;");
        } catch (Exception ignored) {}
        if (request == null) {
            request = new com.eduflow.dto.AiSmartAllocationRequest();
        }
        com.eduflow.dto.AiSmartAllocationResultDto result = aiWorkloadOptimizerService.generateSmartWorkloadAllocation(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/ai-smart-workload-allocation/approve/{versionName}")
    public ResponseEntity<com.eduflow.dto.AiSmartAllocationResultDto> approveAllocationVersion(@PathVariable String versionName) {
        com.eduflow.dto.AiSmartAllocationResultDto result = aiWorkloadOptimizerService.approveAllocationVersion(versionName);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/ai-smart-workload-allocation/versions")
    public ResponseEntity<List<String>> getAvailableVersionNames() {
        return ResponseEntity.ok(aiWorkloadOptimizerService.getAvailableVersionNames());
    }

    @GetMapping("/ai-smart-workload-allocation/version/{versionName}")
    public ResponseEntity<com.eduflow.dto.AiSmartAllocationResultDto> getResultByVersionName(@PathVariable String versionName) {
        return ResponseEntity.ok(aiWorkloadOptimizerService.getResultByVersionName(versionName));
    }

    @GetMapping("/faculty-workload-allocations")
    public ResponseEntity<List<com.eduflow.entity.FacultyWorkloadAllocation>> getWorkloadAllocations(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String version,
            @RequestParam(required = false) Integer semester) {
        List<com.eduflow.entity.FacultyWorkloadAllocation> list;
        if (version != null && !version.trim().isEmpty()) {
            list = allocationRepository.findByVersionName(version);
        } else if (department != null && !department.trim().isEmpty() && !"All".equalsIgnoreCase(department.trim())) {
            list = allocationRepository.findByDepartmentIgnoreCase(normalizeDepartment(department));
        } else {
            list = allocationRepository.findAll();
        }
        if (semester != null) {
            list = list.stream()
                    .filter(a -> a.getSemester() != null && a.getSemester().equals(semester))
                    .collect(java.util.stream.Collectors.toList());
        }
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/faculty-workload-allocations")
    @Transactional
    public ResponseEntity<?> clearWorkloadAllocations() {
        allocationRepository.deleteAll();
        return ResponseEntity.ok(java.util.Map.of("message", "All faculty workload allocations cleared successfully."));
    }

    // ─────────────────────────────────────────
    //  CLASSROOMS
    // ─────────────────────────────────────────

    @GetMapping("/classrooms")
    public ResponseEntity<List<Classroom>> getAllClassrooms() {
        return ResponseEntity.ok(classroomRepository.findAll());
    }

    @PostMapping("/classrooms")
    public ResponseEntity<?> createClassroom(@RequestBody ClassroomRequest request) {
        if (classroomRepository.existsByRoomCodeIgnoreCase(request.getRoomCode())) {
            return ResponseEntity.badRequest().body("Room code already exists: " + request.getRoomCode());
        }
        Classroom room = Classroom.builder()
                .roomCode(request.getRoomCode().toUpperCase())
                .roomName(request.getRoomName())
                .capacity(request.getCapacity())
                .roomType(request.getRoomType())
                .active(true)
                .build();
        classroomRepository.save(room);
        return ResponseEntity.ok(room);
    }

    @DeleteMapping("/classrooms/{id}")
    public ResponseEntity<?> deleteClassroom(@PathVariable Long id) {
        return classroomRepository.findById(id).map(room -> {
            room.setActive(false);
            classroomRepository.save(room);
            return ResponseEntity.ok("Classroom deactivated: " + room.getRoomCode());
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────
    //  TIMETABLE VERSIONS
    // ─────────────────────────────────────────

    @GetMapping("/timetable-versions")
    public ResponseEntity<List<TimetableVersion>> getAllVersions(
            @RequestParam(required = false) String department) {
        if (department != null && !department.trim().isEmpty()) {
            return ResponseEntity.ok(timetableVersionRepository.findByDepartmentIgnoreCase(department));
        }
        return ResponseEntity.ok(timetableVersionRepository.findAll());
    }

    @PostMapping("/timetable-versions")
    public ResponseEntity<?> createVersion(@RequestBody TimetableVersionRequest request) {
        TimetableVersion version = TimetableVersion.builder()
                .department(request.getDepartment())
                .semester(request.getSemester())
                .academicYear(request.getAcademicYear())
                .versionName(request.getVersionName())
                .active(false)
                .build();
        timetableVersionRepository.save(version);
        return ResponseEntity.ok(version);
    }

    @PostMapping("/timetable-versions/activate/{id}")
    @Transactional
    public ResponseEntity<?> activateVersion(@PathVariable Long id) {
        return timetableVersionRepository.findById(id).map(version -> {
            // Deactivate all other versions for same dept + semester
            List<TimetableVersion> others = timetableVersionRepository
                    .findByDepartmentIgnoreCaseAndSemester(version.getDepartment(), version.getSemester());
            others.forEach(v -> {
                v.setActive(false);
                timetableVersionRepository.save(v);
            });
            version.setActive(true);
            timetableVersionRepository.save(version);
            return ResponseEntity.ok("Version activated: " + version.getVersionName());
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/timetable-versions/{id}")
    @Transactional
    public ResponseEntity<?> deleteVersion(@PathVariable Long id) {
        return timetableVersionRepository.findById(id).map(version -> {
            if (version.isActive()) {
                return ResponseEntity.badRequest().body("Cannot delete an active timetable version. Activate another version first.");
            }
            timetableEntryRepository.deleteByVersionId(id);
            timetableVersionRepository.delete(version);
            return ResponseEntity.ok("Version deleted: " + version.getVersionName());
        }).orElse(ResponseEntity.notFound().build());
    }
}
