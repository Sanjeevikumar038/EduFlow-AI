package com.eduflow.controller;

import com.eduflow.service.FaceVerificationService;
import org.springframework.beans.factory.annotation.Value;
import com.eduflow.dto.StartSessionRequest;
import com.eduflow.dto.MarkAttendanceRequest;
import com.eduflow.dto.AttendanceRecordResponse;
import com.eduflow.dto.AttendanceReportRecord;
import com.eduflow.dto.StudentAnalyticsResponse;
import com.eduflow.dto.FacultyAnalyticsResponse;
import com.eduflow.dto.AdminAnalyticsResponse;
import com.eduflow.dto.LowAttendanceStudentResponse;
import com.eduflow.dto.SaveManualAttendanceRequest;
import com.eduflow.entity.AttendanceSession;
import com.eduflow.entity.Attendance;
import com.eduflow.entity.LeaveRequest;
import com.eduflow.entity.LeaveStatus;
import com.eduflow.entity.Role;
import com.eduflow.entity.User;
import com.eduflow.repository.AttendanceSessionRepository;
import com.eduflow.repository.AttendanceRepository;
import com.eduflow.repository.LeaveRequestRepository;
import com.eduflow.repository.UserRepository;
import com.eduflow.repository.CourseClassroomRepository;
import com.eduflow.entity.CourseClassroom;
import com.eduflow.security.SecurityUtils;
import com.eduflow.repository.FacultyExpertiseRepository;
import com.eduflow.entity.FacultyExpertise;
import com.eduflow.repository.SubjectMasterRepository;
import com.eduflow.entity.SubjectMaster;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.LinkedHashSet;
import java.util.Collections;
import java.util.Optional;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceSessionRepository attendanceSessionRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private FacultyExpertiseRepository facultyExpertiseRepository;

    @Autowired
    private SubjectMasterRepository subjectMasterRepository;

    @Autowired
    private CourseClassroomRepository classroomRepository;

    @Autowired
    private FaceVerificationService faceVerificationService;

    @Value("${eduflow.attendance.face.enabled:false}")
    private boolean faceVerificationEnabled;

    private boolean isFacultyAssignedToSubject(User faculty, String subjectCodeOrName) {
        if (faculty == null) return false;
        if (faculty.isClassAdvisor() || faculty.getRole() == Role.ADMIN) {
            return true;
        }
        if (subjectCodeOrName == null || subjectCodeOrName.trim().isEmpty()) {
            return false;
        }
        String target = subjectCodeOrName.trim();
        List<CourseClassroom> classrooms = classroomRepository.findByFacultyId(faculty.getId());
        for (CourseClassroom c : classrooms) {
            if ((c.getSubjectCode() != null && c.getSubjectCode().equalsIgnoreCase(target)) ||
                (c.getSubjectName() != null && c.getSubjectName().equalsIgnoreCase(target))) {
                return true;
            }
        }
        List<FacultyExpertise> expertises = facultyExpertiseRepository.findByFacultyId(faculty.getId());
        for (FacultyExpertise fe : expertises) {
            if (fe.getSubject() != null) {
                if ((fe.getSubject().getSubjectCode() != null && fe.getSubject().getSubjectCode().equalsIgnoreCase(target)) ||
                    (fe.getSubject().getSubjectName() != null && fe.getSubject().getSubjectName().equalsIgnoreCase(target))) {
                    return true;
                }
            }
        }
        return false;
    }

    public List<User> getStudentsForSession(AttendanceSession session, User facultyUser) {
        if (session == null) return Collections.emptyList();
        String targetDept = session.getDepartment();
        Integer targetSem = session.getSemester();
        String targetSec = session.getSection();
        String sessionSubj = session.getSubject() != null ? session.getSubject().trim() : "";

        // If department is missing on session, attempt to infer from CourseClassroom or SubjectMaster
        if ((targetDept == null || targetDept.trim().isEmpty()) && !sessionSubj.isEmpty()) {
            Optional<CourseClassroom> ccOpt = classroomRepository.findAll().stream()
                    .filter(c -> (c.getSubjectCode() != null && c.getSubjectCode().equalsIgnoreCase(sessionSubj)) ||
                                 (c.getSubjectName() != null && c.getSubjectName().equalsIgnoreCase(sessionSubj)))
                    .findFirst();
            if (ccOpt.isPresent()) {
                targetDept = ccOpt.get().getDepartment();
                if (targetSem == null) targetSem = ccOpt.get().getSemester();
                if (targetSec == null) targetSec = ccOpt.get().getSection();
            }
            if (targetDept == null || targetDept.trim().isEmpty()) {
                Optional<SubjectMaster> smOpt = subjectMasterRepository.findBySubjectCode(sessionSubj);
                if (smOpt.isPresent()) {
                    targetDept = smOpt.get().getDepartment();
                    if (targetSem == null) targetSem = smOpt.get().getSemester();
                }
            }
        }

        if (targetDept == null || targetDept.trim().isEmpty()) {
            if (facultyUser != null) {
                targetDept = facultyUser.getDepartment();
            }
        }

        List<User> students;
        if (targetDept != null && !targetDept.trim().isEmpty()) {
            String normTarget = com.eduflow.controller.TimetableController.normalizeDepartment(targetDept);
            students = userRepository.findByRole(Role.STUDENT).stream()
                    .filter(s -> {
                        String sDept = s.getDepartment() != null ? com.eduflow.controller.TimetableController.normalizeDepartment(s.getDepartment()) : "";
                        String sReg = s.getRegisterNumber() != null ? com.eduflow.controller.TimetableController.normalizeDepartment(s.getRegisterNumber()) : "";
                        return sDept.equalsIgnoreCase(normTarget) || sReg.equalsIgnoreCase(normTarget);
                    })
                    .collect(Collectors.toList());
        } else {
            students = userRepository.findByRole(Role.STUDENT);
        }

        // Filter by semester if applicable
        if (targetSem != null) {
            final Integer sem = targetSem;
            List<User> semFiltered = students.stream()
                    .filter(s -> s.getSemester() != null && s.getSemester().equals(sem))
                    .collect(Collectors.toList());
            if (!semFiltered.isEmpty()) {
                students = semFiltered;
            }
        }

        // Filter by section if applicable
        if (targetSec != null && !targetSec.trim().isEmpty()) {
            final String sec = targetSec.trim();
            List<User> secFiltered = students.stream()
                    .filter(s -> s.getSection() != null && s.getSection().equalsIgnoreCase(sec))
                    .collect(Collectors.toList());
            if (!secFiltered.isEmpty()) {
                students = secFiltered;
            }
        }

        // Sort students in natural alphanumeric attendance register / roll number order
        students.sort((u1, u2) -> {
            String r1 = u1.getRegisterNumber() != null ? u1.getRegisterNumber().trim() : "";
            String r2 = u2.getRegisterNumber() != null ? u2.getRegisterNumber().trim() : "";
            if (!r1.isEmpty() && !r2.isEmpty()) {
                return r1.compareToIgnoreCase(r2);
            }
            String n1 = u1.getName() != null ? u1.getName().trim() : "";
            String n2 = u2.getName() != null ? u2.getName().trim() : "";
            return n1.compareToIgnoreCase(n2);
        });

        return students;
    }

    private void populateOtp(AttendanceSession session) {
        if (session != null) {
            long timeInterval = System.currentTimeMillis() / 10000; // 10 second steps
            session.setCurrentOtp(SecurityUtils.generateOTP(session.getId(), timeInterval));
        }
    }

    @GetMapping("/my-subjects")
    public ResponseEntity<?> getMySubjects(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found!");
        }
        User user = userOpt.get();
        List<Map<String, Object>> result = new ArrayList<>();

        if (user.getRole() == Role.ADMIN) {
            List<CourseClassroom> allClassrooms = classroomRepository.findAll();
            if (!allClassrooms.isEmpty()) {
                for (CourseClassroom c : allClassrooms) {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", c.getId());
                    map.put("subjectCode", c.getSubjectCode());
                    map.put("subjectName", c.getSubjectName());
                    map.put("department", c.getDepartment());
                    map.put("semester", c.getSemester());
                    map.put("section", c.getSection() != null ? c.getSection() : "A");
                    map.put("facultyName", c.getFaculty() != null ? c.getFaculty().getName() : "");
                    result.add(map);
                }
                return ResponseEntity.ok(result);
            }
            return ResponseEntity.ok(subjectMasterRepository.findByActiveTrue());
        }

        // For Faculty: Prioritize allocated course classrooms!
        List<CourseClassroom> allocatedClassrooms = classroomRepository.findByFacultyId(user.getId());
        if (!allocatedClassrooms.isEmpty()) {
            for (CourseClassroom c : allocatedClassrooms) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", c.getId());
                map.put("subjectCode", c.getSubjectCode());
                map.put("subjectName", c.getSubjectName());
                map.put("department", c.getDepartment());
                map.put("semester", c.getSemester());
                map.put("section", c.getSection() != null ? c.getSection() : "A");
                result.add(map);
            }
            return ResponseEntity.ok(result);
        }

        // Fallback for Class Advisor or Faculty without CourseClassrooms yet
        if (user.isClassAdvisor()) {
            String dept = user.getDepartment();
            List<SubjectMaster> subjects = (dept != null && !dept.trim().isEmpty())
                    ? subjectMasterRepository.findByDepartmentIgnoreCaseAndActiveTrue(dept)
                    : subjectMasterRepository.findByActiveTrue();
            for (SubjectMaster sm : subjects) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", sm.getId());
                map.put("subjectCode", sm.getSubjectCode());
                map.put("subjectName", sm.getSubjectName());
                map.put("department", sm.getDepartment());
                map.put("semester", sm.getSemester());
                map.put("section", "A");
                result.add(map);
            }
            return ResponseEntity.ok(result);
        }

        List<FacultyExpertise> expertises = facultyExpertiseRepository.findByFacultyId(user.getId());
        for (FacultyExpertise fe : expertises) {
            SubjectMaster sm = fe.getSubject();
            if (sm != null) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", sm.getId());
                map.put("subjectCode", sm.getSubjectCode());
                map.put("subjectName", sm.getSubjectName());
                map.put("department", sm.getDepartment());
                map.put("semester", sm.getSemester());
                map.put("section", "A");
                result.add(map);
            }
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/session/start")
    public ResponseEntity<?> startSession(
            @Valid @RequestBody StartSessionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found!");
        }

        User user = userOpt.get();
        if (user.getRole() != Role.FACULTY) {
            return ResponseEntity.status(403).body("Only faculty can start attendance sessions!");
        }

        if (!isFacultyAssignedToSubject(user, request.getSubject())) {
            return ResponseEntity.status(403).body("You do not have permission to start attendance for subject " + request.getSubject() + "!");
        }

        // Determine target department, semester, section
        String targetDept = request.getDepartment();
        Integer targetSem = request.getSemester();
        String targetSec = request.getSection();

        if (targetDept == null || targetDept.trim().isEmpty()) {
            List<CourseClassroom> fClassrooms = classroomRepository.findByFacultyId(user.getId());
            for (CourseClassroom c : fClassrooms) {
                if (c.getSubjectCode().equalsIgnoreCase(request.getSubject().trim())) {
                    targetDept = c.getDepartment();
                    targetSem = c.getSemester();
                    targetSec = c.getSection();
                    break;
                }
            }
        }
        if (targetDept == null || targetDept.trim().isEmpty()) {
            targetDept = user.getDepartment();
        }

        // Deactivate any existing active sessions in this department to maintain a single active session per department
        List<AttendanceSession> activeSessions = attendanceSessionRepository.findByActive(true);
        for (AttendanceSession session : activeSessions) {
            Optional<User> creatorOpt = userRepository.findById(session.getFacultyId());
            if (creatorOpt.isPresent()) {
                User creator = creatorOpt.get();
                if (user.getDepartment() != null && user.getDepartment().equalsIgnoreCase(creator.getDepartment())) {
                    session.setActive(false);
                    attendanceSessionRepository.save(session);
                }
            } else if (session.getFacultyId().equals(user.getId())) {
                session.setActive(false);
                attendanceSessionRepository.save(session);
            }
        }

        LocalDateTime startTime = LocalDateTime.now();
        LocalDateTime expiryTime = startTime.plusMinutes(request.getDurationMinutes());

        AttendanceSession newSession = AttendanceSession.builder()
                .subject(request.getSubject())
                .facultyId(user.getId())
                .department(targetDept)
                .semester(targetSem)
                .section(targetSec != null ? targetSec : "A")
                .startTime(startTime)
                .expiryTime(expiryTime)
                .active(true)
                .build();

        attendanceSessionRepository.save(newSession);
        populateOtp(newSession);
        newSession.setFacultyName(user.getName());

        return ResponseEntity.ok(newSession);
    }

    @PostMapping("/session/end/{id}")
    public ResponseEntity<?> endSession(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found!");
        }

        User user = userOpt.get();
        Optional<AttendanceSession> sessionOpt = attendanceSessionRepository.findById(id);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        AttendanceSession session = sessionOpt.get();
        if (!session.getFacultyId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("You do not have permission to end this session!");
        }

        session.setActive(false);
        attendanceSessionRepository.save(session);

        return ResponseEntity.ok(session);
    }

    @GetMapping("/session/active")
    public ResponseEntity<?> getActiveSession(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found!");
        }

        User user = userOpt.get();
        List<AttendanceSession> activeSessions = attendanceSessionRepository.findByActive(true);

        // Filter active sessions by department if the user is a Faculty
        if (user.getRole() == Role.FACULTY) {
            String dept = user.getDepartment();
            Optional<AttendanceSession> deptActive = activeSessions.stream()
                    .filter(s -> {
                        if (s.getFacultyId().equals(user.getId())) {
                            return true;
                        }
                        Optional<User> creatorOpt = userRepository.findById(s.getFacultyId());
                        if (creatorOpt.isPresent()) {
                            User creator = creatorOpt.get();
                            return creator.getDepartment() != null && 
                                   creator.getDepartment().equalsIgnoreCase(dept);
                        }
                        return false;
                    })
                    .findFirst();
            
            if (deptActive.isPresent()) {
                // Double check if it has expired
                AttendanceSession session = deptActive.get();
                if (LocalDateTime.now().isAfter(session.getExpiryTime())) {
                    session.setActive(false);
                    attendanceSessionRepository.save(session);
                    return ResponseEntity.ok().body(null);
                }
                populateOtp(session);
                Optional<User> creatorOpt = userRepository.findById(session.getFacultyId());
                session.setFacultyName(creatorOpt.map(User::getName).orElse("Unknown"));
                return ResponseEntity.ok(session);
            }
            return ResponseEntity.ok().body(null);
        }

        // Filter active sessions by cohort / department if the user is a Student
        if (user.getRole() == Role.STUDENT) {
            String dept = user.getDepartment();
            if (dept != null && !dept.trim().isEmpty()) {
                String normStudentDept = com.eduflow.controller.TimetableController.normalizeDepartment(dept);
                String normRegDept = user.getRegisterNumber() != null ? com.eduflow.controller.TimetableController.normalizeDepartment(user.getRegisterNumber()) : "";

                Optional<AttendanceSession> deptActive = activeSessions.stream()
                        .filter(s -> {
                            // Check if session cohort matches student
                            if (s.getDepartment() != null && !s.getDepartment().trim().isEmpty()) {
                                String normSessionDept = com.eduflow.controller.TimetableController.normalizeDepartment(s.getDepartment());
                                boolean deptMatch = normSessionDept.equalsIgnoreCase(normStudentDept) || (normRegDept != null && normSessionDept.equalsIgnoreCase(normRegDept));
                                if (deptMatch) {
                                    if (s.getSemester() != null && user.getSemester() != null && !s.getSemester().equals(user.getSemester())) {
                                        return false;
                                    }
                                    if (s.getSection() != null && user.getSection() != null && !s.getSection().equalsIgnoreCase(user.getSection())) {
                                        return false;
                                    }
                                    return true;
                                }
                            }
                            // Fallback to faculty creator's department
                            Optional<User> creatorOpt = userRepository.findById(s.getFacultyId());
                            if (creatorOpt.isPresent()) {
                                User creator = creatorOpt.get();
                                if (creator.getDepartment() != null) {
                                    String normCreatorDept = com.eduflow.controller.TimetableController.normalizeDepartment(creator.getDepartment());
                                    return normCreatorDept.equalsIgnoreCase(normStudentDept) || (normRegDept != null && normCreatorDept.equalsIgnoreCase(normRegDept));
                                }
                            }
                            return false;
                        })
                        .findFirst();
                
                if (deptActive.isPresent()) {
                    AttendanceSession session = deptActive.get();
                    if (LocalDateTime.now().isAfter(session.getExpiryTime())) {
                        session.setActive(false);
                        attendanceSessionRepository.save(session);
                        return ResponseEntity.ok().body(null);
                    }
                    populateOtp(session);
                    Optional<User> creatorOpt = userRepository.findById(session.getFacultyId());
                    session.setFacultyName(creatorOpt.map(User::getName).orElse("Unknown"));
                    return ResponseEntity.ok(session);
                }
            }
            return ResponseEntity.ok().body(null);
        }

        // Fallback for Admin or other roles: return latest active session overall
        if (!activeSessions.isEmpty()) {
            AttendanceSession session = activeSessions.get(activeSessions.size() - 1);
            if (LocalDateTime.now().isAfter(session.getExpiryTime())) {
                session.setActive(false);
                attendanceSessionRepository.save(session);
                return ResponseEntity.ok().body(null);
            }
            populateOtp(session);
            Optional<User> creatorOpt = userRepository.findById(session.getFacultyId());
            session.setFacultyName(creatorOpt.map(User::getName).orElse("Unknown"));
            return ResponseEntity.ok(session);
        }

        return ResponseEntity.ok().body(null);
    }

    @PostMapping("/mark")
    public ResponseEntity<?> markAttendance(
            @Valid @RequestBody MarkAttendanceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found!");
        }
        User student = userOpt.get();
        if (student.getRole() != Role.STUDENT) {
            return ResponseEntity.status(403).body("Only students can mark attendance!");
        }

        if (faceVerificationEnabled) {
            if (!faceVerificationService.isVerifiedRecent(student.getEmail())) {
                return ResponseEntity.status(403).body("Mobile Face Verification is required to mark attendance!");
            }
        }

        Optional<AttendanceSession> sessionOpt = attendanceSessionRepository.findById(request.getSessionId());
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Attendance session not found!");
        }

        AttendanceSession session = sessionOpt.get();
        if (!session.isActive()) {
            return ResponseEntity.badRequest().body("Attendance session is not active!");
        }

        if (LocalDateTime.now().isAfter(session.getExpiryTime())) {
            session.setActive(false);
            attendanceSessionRepository.save(session);
            return ResponseEntity.badRequest().body("Attendance session has expired!");
        }

        // Verify student department/cohort matches session
        String sessionDept = session.getDepartment();
        if (sessionDept != null && !sessionDept.trim().isEmpty()) {
            String normSD = com.eduflow.controller.TimetableController.normalizeDepartment(sessionDept);
            String normStudentDept = student.getDepartment() != null ? com.eduflow.controller.TimetableController.normalizeDepartment(student.getDepartment()) : "";
            String normRegDept = student.getRegisterNumber() != null ? com.eduflow.controller.TimetableController.normalizeDepartment(student.getRegisterNumber()) : "";
            boolean deptMatch = normSD.equalsIgnoreCase(normStudentDept) || (normRegDept != null && normSD.equalsIgnoreCase(normRegDept));
            if (!deptMatch) {
                Optional<User> facultyOpt = userRepository.findById(session.getFacultyId());
                if (facultyOpt.isPresent() && facultyOpt.get().getDepartment() != null) {
                    String normFD = com.eduflow.controller.TimetableController.normalizeDepartment(facultyOpt.get().getDepartment());
                    if (!normFD.equalsIgnoreCase(normStudentDept) && (normRegDept == null || !normFD.equalsIgnoreCase(normRegDept))) {
                        return ResponseEntity.badRequest().body("You cannot mark attendance for a class in a different department (" + sessionDept + ")!");
                    }
                }
            }
        }

        // Verify the dynamic OTP
        long currentInterval = System.currentTimeMillis() / 10000;
        boolean isOtpValid = false;
        // Check window of 5 intervals (-2 to +2) to account for time drift or transmission lag
        for (int offset = -2; offset <= 2; offset++) {
            String expectedOtp = SecurityUtils.generateOTP(session.getId(), currentInterval + offset);
            if (expectedOtp.equals(request.getOtp())) {
                isOtpValid = true;
                break;
            }
        }

        if (!isOtpValid) {
            return ResponseEntity.badRequest().body("Invalid or expired QR verification code!");
        }

        // Check if student has already marked attendance for this session
        List<Attendance> existing = attendanceRepository.findBySessionId(session.getId());
        boolean alreadyMarked = existing.stream()
                .anyMatch(a -> a.getStudentId().equals(student.getId()));
        if (alreadyMarked) {
            return ResponseEntity.badRequest().body("You have already marked attendance for this session!");
        }

        Attendance attendance = Attendance.builder()
                .studentId(student.getId())
                .sessionId(session.getId())
                .date(LocalDate.now())
                .time(LocalTime.now())
                .status("PRESENT")
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .method("QR")
                .build();

        attendanceRepository.save(attendance);

        return ResponseEntity.ok("Attendance marked successfully as PRESENT!");
    }

    @GetMapping("/session/{sessionId}/records")
    public ResponseEntity<?> getSessionRecords(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found!");
        }
        User user = userOpt.get();

        Optional<AttendanceSession> sessionOpt = attendanceSessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        AttendanceSession session = sessionOpt.get();

        // Security check: Only the faculty who started it, faculty in the same department, or an ADMIN can view the records
        boolean isCreatorOrSameDept = false;
        if (session.getFacultyId().equals(user.getId())) {
            isCreatorOrSameDept = true;
        } else {
            Optional<User> creatorOpt = userRepository.findById(session.getFacultyId());
            if (creatorOpt.isPresent()) {
                User creator = creatorOpt.get();
                if (user.getDepartment() != null && user.getDepartment().equalsIgnoreCase(creator.getDepartment())) {
                    isCreatorOrSameDept = true;
                }
            }
        }

        if (!isCreatorOrSameDept && user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("You do not have permission to view records for this session!");
        }

        List<Attendance> records = attendanceRepository.findBySessionId(sessionId);
        List<AttendanceRecordResponse> responseList = records.stream()
                .map(record -> {
                    Optional<User> studentOpt = userRepository.findById(record.getStudentId());
                    String studentName = studentOpt.map(User::getName).orElse("Unknown");
                    String regNo = studentOpt.map(User::getRegisterNumber).orElse("N/A");
                    String dept = studentOpt.map(User::getDepartment).orElse("");
                    
                    AttendanceRecordResponse resp = AttendanceRecordResponse.builder()
                            .id(record.getId())
                            .studentId(record.getStudentId())
                            .studentName(studentName)
                            .registerNumber(regNo)
                            .time(record.getTime())
                            .status(record.getStatus())
                            .latitude(record.getLatitude())
                            .longitude(record.getLongitude())
                            .build();

                    return new Object() {
                        public final AttendanceRecordResponse r = resp;
                        public final String department = dept;
                    };
                })
                .filter(item -> {
                    if (user.getRole() == Role.FACULTY) {
                        return user.getDepartment() != null && user.getDepartment().equalsIgnoreCase(item.department);
                    }
                    return true;
                })
                .map(item -> item.r)
                .toList();

        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> getAllSessions(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found!");
        }
        User user = userOpt.get();

        List<AttendanceSession> sessions;
        if (user.getRole() == Role.ADMIN) {
            sessions = new java.util.ArrayList<>(attendanceSessionRepository.findAll());
        } else if (user.getRole() == Role.FACULTY) {
            String dept = user.getDepartment();
            String normFacultyDept = dept != null ? com.eduflow.controller.TimetableController.normalizeDepartment(dept) : "";
            List<AttendanceSession> allSessions = attendanceSessionRepository.findAll();
            sessions = allSessions.stream().filter(s -> {
                // Sessions created by this faculty
                if (s.getFacultyId() != null && s.getFacultyId().equals(user.getId())) return true;
                // Sessions for subjects assigned to this faculty
                if (isFacultyAssignedToSubject(user, s.getSubject())) return true;
                // Class advisor can see sessions in their department
                if (user.isClassAdvisor() && s.getDepartment() != null) {
                    String normSD = com.eduflow.controller.TimetableController.normalizeDepartment(s.getDepartment());
                    if (normSD.equalsIgnoreCase(normFacultyDept)) return true;
                }
                return false;
            }).collect(Collectors.toList());
        } else {
            return ResponseEntity.status(403).body("Students cannot view all sessions!");
        }

        // Sort latest first
        sessions.sort((s1, s2) -> {
            if (s1.getId() == null && s2.getId() == null) return 0;
            if (s1.getId() == null) return 1;
            if (s2.getId() == null) return -1;
            return s2.getId().compareTo(s1.getId());
        });

        // Populate conductor/faculty names for frontend
        for (AttendanceSession s : sessions) {
            if (s.getFacultyId() != null) {
                Optional<User> fOpt = userRepository.findById(s.getFacultyId());
                s.setFacultyName(fOpt.map(User::getName).orElse("Unknown"));
            } else {
                s.setFacultyName("System");
            }
        }

        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/session/{sessionId}/report")
    public ResponseEntity<?> getSessionReport(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found!");
        }
        User user = userOpt.get();

        Optional<AttendanceSession> sessionOpt = attendanceSessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        AttendanceSession session = sessionOpt.get();

        // Security check: Only the faculty who started it, faculty in the same department, or an ADMIN can view this report
        boolean isCreatorOrSameDept = false;
        if (session.getFacultyId() != null && session.getFacultyId().equals(user.getId())) {
            isCreatorOrSameDept = true;
        } else if (session.getFacultyId() != null) {
            Optional<User> creatorOpt = userRepository.findById(session.getFacultyId());
            if (creatorOpt.isPresent()) {
                User creator = creatorOpt.get();
                if (user.getDepartment() != null && user.getDepartment().equalsIgnoreCase(creator.getDepartment())) {
                    isCreatorOrSameDept = true;
                }
            }
        }

        if (user.getRole() == Role.FACULTY) {
            boolean isCreator = session.getFacultyId() != null && session.getFacultyId().equals(user.getId());
            if (!isCreator && !user.isClassAdvisor() && !isFacultyAssignedToSubject(user, session.getSubject())) {
                return ResponseEntity.status(403).body("You do not have permission to view this report!");
            }
        } else if (user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("You do not have permission to view this report!");
        }

        // Get students based on the session's allocated subject/cohort
        List<User> students = getStudentsForSession(session, user);
        
        // Get all attendance check-ins for this session
        List<Attendance> checkIns = attendanceRepository.findBySessionId(sessionId);

        List<AttendanceReportRecord> report = students.stream().map(student -> {
            Optional<Attendance> checkInOpt = checkIns.stream()
                    .filter(c -> c.getStudentId().equals(student.getId()))
                    .findFirst();

            if (checkInOpt.isPresent()) {
                Attendance c = checkInOpt.get();
                return AttendanceReportRecord.builder()
                        .studentName(student.getName())
                        .registerNumber(student.getRegisterNumber())
                        .status("PRESENT")
                        .time(c.getTime())
                        .latitude(c.getLatitude())
                        .longitude(c.getLongitude())
                        .build();
            } else {
                return AttendanceReportRecord.builder()
                        .studentName(student.getName())
                        .registerNumber(student.getRegisterNumber() != null ? student.getRegisterNumber() : "Pending")
                        .status("ABSENT")
                        .time(null)
                        .latitude(null)
                        .longitude(null)
                        .build();
            }
        }).toList();

        return ResponseEntity.ok(report);
    }

    @GetMapping("/analytics/student")
    public ResponseEntity<?> getStudentAnalytics(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found!");
        }
        User student = userOpt.get();
        if (student.getRole() != Role.STUDENT) {
            return ResponseEntity.status(403).body("Only students can view student analytics!");
        }

        String dept = student.getDepartment();
        String normStudentDept = com.eduflow.controller.TimetableController.normalizeDepartment(dept);
        String normRegDept = student.getRegisterNumber() != null ? com.eduflow.controller.TimetableController.normalizeDepartment(student.getRegisterNumber()) : "";

        // 1. Get all attendance records for this student
        List<Attendance> attendances = attendanceRepository.findByStudentId(student.getId());
        java.util.Set<Long> attendedSessionIds = attendances.stream()
                .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()) || "LATE".equalsIgnoreCase(a.getStatus()))
                .map(Attendance::getSessionId)
                .collect(java.util.stream.Collectors.toSet());
        java.util.Set<Long> excusedSessionIds = attendances.stream()
                .filter(a -> "EXCUSED".equalsIgnoreCase(a.getStatus()))
                .map(Attendance::getSessionId)
                .collect(java.util.stream.Collectors.toSet());
        java.util.Set<Long> recordedSessionIds = attendances.stream()
                .map(Attendance::getSessionId)
                .collect(java.util.stream.Collectors.toSet());

        // 2. Get all relevant sessions for student's cohort
        List<AttendanceSession> allSessions = attendanceSessionRepository.findAll();
        List<AttendanceSession> studentSessions = allSessions.stream()
                .filter(s -> {
                    // Match recorded sessions directly
                    if (recordedSessionIds.contains(s.getId())) return true;
                    // Match cohort department, semester, section
                    if (s.getDepartment() != null && !s.getDepartment().trim().isEmpty()) {
                        String normSD = com.eduflow.controller.TimetableController.normalizeDepartment(s.getDepartment());
                        if (normSD.equalsIgnoreCase(normStudentDept) || (normRegDept != null && normSD.equalsIgnoreCase(normRegDept))) {
                            if (s.getSemester() != null && student.getSemester() != null && !s.getSemester().equals(student.getSemester())) {
                                return false;
                            }
                            if (s.getSection() != null && student.getSection() != null && !s.getSection().equalsIgnoreCase(student.getSection())) {
                                return false;
                            }
                            return true;
                        }
                    }
                    // Match creator's department
                    Optional<User> creatorOpt = userRepository.findById(s.getFacultyId());
                    if (creatorOpt.isPresent()) {
                        User creator = creatorOpt.get();
                        if (creator.getDepartment() != null) {
                            String normCD = com.eduflow.controller.TimetableController.normalizeDepartment(creator.getDepartment());
                            return normCD.equalsIgnoreCase(normStudentDept) || (normRegDept != null && normCD.equalsIgnoreCase(normRegDept));
                        }
                    }
                    return false;
                })
                .toList();

        // 3. Filter countable sessions (exclude excused)
        List<AttendanceSession> countableSessions = studentSessions.stream()
                .filter(s -> !excusedSessionIds.contains(s.getId()))
                .toList();

        int totalSessions = countableSessions.size();
        int presentSessions = (int) countableSessions.stream().filter(s -> attendedSessionIds.contains(s.getId())).count();
        int absentSessions = totalSessions - presentSessions;
        int excusedCount = excusedSessionIds.size();
        double overallPercentage = totalSessions > 0 ? (presentSessions * 100.0) / totalSessions : 100.0;

        // Categorize status
        String status = "Needs Improvement";
        if (overallPercentage >= 95.0) status = "Excellent";
        else if (overallPercentage >= 85.0) status = "Good";
        else if (overallPercentage >= 75.0) status = "Average";

        boolean lowWarning = overallPercentage < 75.0;
        String alertLevel = overallPercentage >= 75.0 ? "NORMAL" : overallPercentage >= 60.0 ? "WARNING" : "CRITICAL";
        String alertMessage = null;
        if ("CRITICAL".equals(alertLevel)) {
            alertMessage = String.format("⛔ CRITICAL: Your attendance is %.1f%% — well below the required 75%%. Immediate action required!", overallPercentage);
        } else if ("WARNING".equals(alertLevel)) {
            alertMessage = String.format("⚠ WARNING: Your attendance is %.1f%% — approaching the 75%% minimum threshold. Attend classes regularly to avoid detention.", overallPercentage);
        }

        // 4. Find all Curriculum Subjects for student from SubjectMaster
        List<SubjectMaster> masterSubjects = subjectMasterRepository.findAll().stream()
                .filter(sm -> {
                    if (sm.getDepartment() == null) return false;
                    String normSmDept = com.eduflow.controller.TimetableController.normalizeDepartment(sm.getDepartment());
                    boolean deptMatch = normSmDept.equalsIgnoreCase(normStudentDept) || (normRegDept != null && normSmDept.equalsIgnoreCase(normRegDept));
                    if (deptMatch) {
                        return student.getSemester() == null || sm.getSemester() == null || sm.getSemester().equals(student.getSemester());
                    }
                    return false;
                })
                .toList();

        // 5. Build subject-wise attendance map (seed with curriculum subjects + any session subjects)
        Map<String, List<AttendanceSession>> subjectSessionsMap = countableSessions.stream()
                .collect(Collectors.groupingBy(s -> s.getSubject().trim()));

        // Active sessions currently live for student's cohort
        List<AttendanceSession> liveActiveSessions = allSessions.stream()
                .filter(s -> s.isActive() && LocalDateTime.now().isBefore(s.getExpiryTime()))
                .filter(s -> {
                    if (s.getDepartment() != null && !s.getDepartment().trim().isEmpty()) {
                        String normSD = com.eduflow.controller.TimetableController.normalizeDepartment(s.getDepartment());
                        if (normSD.equalsIgnoreCase(normStudentDept) || (normRegDept != null && normSD.equalsIgnoreCase(normRegDept))) {
                            if (s.getSemester() != null && student.getSemester() != null && !s.getSemester().equals(student.getSemester())) {
                                return false;
                            }
                            if (s.getSection() != null && student.getSection() != null && !s.getSection().equalsIgnoreCase(student.getSection())) {
                                return false;
                            }
                            return true;
                        }
                    }
                    Optional<User> creatorOpt = userRepository.findById(s.getFacultyId());
                    if (creatorOpt.isPresent() && creatorOpt.get().getDepartment() != null) {
                        String normCD = com.eduflow.controller.TimetableController.normalizeDepartment(creatorOpt.get().getDepartment());
                        return normCD.equalsIgnoreCase(normStudentDept) || (normRegDept != null && normCD.equalsIgnoreCase(normRegDept));
                    }
                    return false;
                })
                .toList();

        // Collect all distinct subject codes
        Set<String> allSubjectKeys = new LinkedHashSet<>();
        for (SubjectMaster sm : masterSubjects) {
            allSubjectKeys.add(sm.getSubjectCode().trim());
        }
        for (String sessSub : subjectSessionsMap.keySet()) {
            allSubjectKeys.add(sessSub.trim());
        }
        for (AttendanceSession as : liveActiveSessions) {
            if (as.getSubject() != null) allSubjectKeys.add(as.getSubject().trim());
        }

        // If there is a more specific variant like '25XXXX-4064', suppress the bare generic '25XXXX'
        Set<String> filteredSubjectKeys = new LinkedHashSet<>();
        for (String k : allSubjectKeys) {
            boolean hasMoreSpecificVariant = allSubjectKeys.stream()
                    .anyMatch(other -> !other.equalsIgnoreCase(k) && other.toUpperCase().startsWith(k.toUpperCase() + "-"));
            if (!hasMoreSpecificVariant) {
                filteredSubjectKeys.add(k);
            }
        }

        List<StudentAnalyticsResponse.SubjectAttendance> subjectStats = new ArrayList<>();
        for (String subKey : filteredSubjectKeys) {
            List<AttendanceSession> sList = subjectSessionsMap.getOrDefault(subKey, Collections.emptyList());
            int subTotal = sList.size();
            int subPresent = (int) sList.stream().filter(s -> attendedSessionIds.contains(s.getId())).count();
            int subAbsent = subTotal - subPresent;
            double subPercentage = subTotal > 0 ? (subPresent * 100.0) / subTotal : 100.0;

            // Find matching subject master metadata
            Optional<SubjectMaster> smOpt = masterSubjects.stream()
                    .filter(sm -> sm.getSubjectCode().equalsIgnoreCase(subKey) || 
                                  subKey.toUpperCase().startsWith(sm.getSubjectCode().toUpperCase() + "-") ||
                                  subKey.toLowerCase().contains(sm.getSubjectCode().toLowerCase()))
                    .findFirst();

            String subName = smOpt.map(SubjectMaster::getSubjectName).orElse(subKey);

            // Check if there is an active session for this subject
            Optional<AttendanceSession> activeForSub = liveActiveSessions.stream()
                    .filter(as -> as.getSubject() != null && (
                            as.getSubject().equalsIgnoreCase(subKey) ||
                            (smOpt.isPresent() && as.getSubject().equalsIgnoreCase(smOpt.get().getSubjectCode()))
                    ))
                    .findFirst();

            boolean hasActive = activeForSub.isPresent();
            Long activeId = null;
            String currentOtp = null;
            String expiryTimeStr = null;
            Integer timeLeftSec = null;
            String facultyName = null;

            if (hasActive) {
                AttendanceSession as = activeForSub.get();
                populateOtp(as);
                activeId = as.getId();
                currentOtp = as.getCurrentOtp();
                expiryTimeStr = as.getExpiryTime() != null ? as.getExpiryTime().toString() : null;
                if (as.getExpiryTime() != null) {
                    long diffSec = java.time.Duration.between(LocalDateTime.now(), as.getExpiryTime()).getSeconds();
                    timeLeftSec = Math.max(0, (int) diffSec);
                }
                if (as.getFacultyId() != null) {
                    Optional<User> fOpt = userRepository.findById(as.getFacultyId());
                    facultyName = fOpt.map(User::getName).orElse(as.getFacultyName());
                }
            } else if (!sList.isEmpty()) {
                AttendanceSession latestSess = sList.get(sList.size() - 1);
                if (latestSess.getFacultyId() != null) {
                    Optional<User> fOpt = userRepository.findById(latestSess.getFacultyId());
                    facultyName = fOpt.map(User::getName).orElse(latestSess.getFacultyName());
                }
            }

            // Fallback 1: Resolve assigned faculty from CourseClassroom
            if (facultyName == null || facultyName.trim().isEmpty()) {
                final String currentSub = subKey;
                List<CourseClassroom> classrooms = classroomRepository.findAll();
                Optional<CourseClassroom> ccOpt = classrooms.stream()
                        .filter(cc -> cc.getFaculty() != null)
                        .filter(cc -> {
                            String code = cc.getSubjectCode() != null ? cc.getSubjectCode().trim() : "";
                            String name = cc.getSubjectName() != null ? cc.getSubjectName().trim() : "";
                            return code.equalsIgnoreCase(currentSub) || 
                                   name.equalsIgnoreCase(currentSub) ||
                                   (smOpt.isPresent() && (code.equalsIgnoreCase(smOpt.get().getSubjectCode()) || name.equalsIgnoreCase(smOpt.get().getSubjectName()))) ||
                                   currentSub.toUpperCase().startsWith(code.toUpperCase() + "-");
                        })
                        .findFirst();
                if (ccOpt.isPresent()) {
                    facultyName = ccOpt.get().getFaculty().getName();
                }
            }

            // Fallback 2: Resolve assigned faculty from FacultyExpertise
            if (facultyName == null || facultyName.trim().isEmpty()) {
                final String currentSub = subKey;
                List<FacultyExpertise> expertises = facultyExpertiseRepository.findAll();
                Optional<FacultyExpertise> feOpt = expertises.stream()
                        .filter(fe -> fe.getFaculty() != null && fe.getSubject() != null)
                        .filter(fe -> {
                            String code = fe.getSubject().getSubjectCode() != null ? fe.getSubject().getSubjectCode().trim() : "";
                            String name = fe.getSubject().getSubjectName() != null ? fe.getSubject().getSubjectName().trim() : "";
                            return code.equalsIgnoreCase(currentSub) || 
                                   name.equalsIgnoreCase(currentSub) ||
                                   (smOpt.isPresent() && (code.equalsIgnoreCase(smOpt.get().getSubjectCode()) || name.equalsIgnoreCase(smOpt.get().getSubjectName()))) ||
                                   currentSub.toUpperCase().startsWith(code.toUpperCase() + "-");
                        })
                        .findFirst();
                if (feOpt.isPresent()) {
                    facultyName = feOpt.get().getFaculty().getName();
                }
            }

            // Fallback 3: Resolve from any attendance session ever recorded for this subject
            if (facultyName == null || facultyName.trim().isEmpty()) {
                final String currentSub = subKey;
                Optional<AttendanceSession> anySess = allSessions.stream()
                        .filter(s -> s.getSubject() != null && s.getFacultyId() != null)
                        .filter(s -> {
                            String sub = s.getSubject().trim();
                            return sub.equalsIgnoreCase(currentSub) || 
                                   (smOpt.isPresent() && sub.equalsIgnoreCase(smOpt.get().getSubjectCode())) ||
                                   sub.toUpperCase().startsWith(currentSub.toUpperCase() + "-") ||
                                   currentSub.toUpperCase().startsWith(sub.toUpperCase() + "-");
                        })
                        .findFirst();
                if (anySess.isPresent()) {
                    Optional<User> fOpt = userRepository.findById(anySess.get().getFacultyId());
                    facultyName = fOpt.map(User::getName).orElse(anySess.get().getFacultyName());
                }
            }

            // Fallback 4: Check if any faculty in the department is assigned to this subject
            if (facultyName == null || facultyName.trim().isEmpty()) {
                final String currentSub = subKey;
                if (dept != null && !dept.trim().isEmpty()) {
                    List<User> deptFaculties = userRepository.findByRoleAndDepartmentIgnoreCase(Role.FACULTY, dept);
                    for (User df : deptFaculties) {
                        if (isFacultyAssignedToSubject(df, currentSub)) {
                            facultyName = df.getName();
                            break;
                        }
                    }
                }
            }

            subjectStats.add(StudentAnalyticsResponse.SubjectAttendance.builder()
                    .subject(subKey)
                    .subjectName(subName)
                    .facultyName(facultyName)
                    .attendancePercentage(subPercentage)
                    .presentClasses(subPresent)
                    .absentClasses(subAbsent)
                    .isLow(subPercentage < 75.0)
                    .hasActiveSession(hasActive)
                    .activeSessionId(activeId)
                    .currentOtp(currentOtp)
                    .expiryTime(expiryTimeStr)
                    .timeLeftSeconds(timeLeftSec)
                    .build());
        }

        // Sort: active sessions first, then alphabetical by subject code
        subjectStats.sort((a, b) -> {
            if (a.isHasActiveSession() != b.isHasActiveSession()) {
                return a.isHasActiveSession() ? -1 : 1;
            }
            return a.getSubject().compareToIgnoreCase(b.getSubject());
        });

        // 6. Trend by date
        Map<LocalDate, List<AttendanceSession>> dateSessions = countableSessions.stream()
                .collect(Collectors.groupingBy(s -> s.getStartTime().toLocalDate()));

        List<StudentAnalyticsResponse.AttendanceTrend> trendList = dateSessions.entrySet().stream()
                .map(entry -> {
                    LocalDate date = entry.getKey();
                    List<AttendanceSession> sList = entry.getValue();
                    int totalOnDate = sList.size();
                    int presentOnDate = (int) sList.stream().filter(s -> attendedSessionIds.contains(s.getId())).count();
                    double pctOnDate = totalOnDate > 0 ? (presentOnDate * 100.0) / totalOnDate : 100.0;
                    return StudentAnalyticsResponse.AttendanceTrend.builder().date(date.toString()).percentage(pctOnDate).build();
                })
                .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
                .toList();

        return ResponseEntity.ok(StudentAnalyticsResponse.builder()
                .overallAttendancePercentage(overallPercentage)
                .presentClasses(presentSessions).absentClasses(absentSessions).excusedClasses(excusedCount)
                .attendanceStatus(status).lowAttendanceWarning(lowWarning)
                .alertLevel(alertLevel).alertMessage(alertMessage)
                .subjectWiseAttendance(subjectStats).attendanceTrend(trendList).build());
    }

    // ── CSV Export ──────────────────────────────────────────────────────────────
    @GetMapping("/session/{sessionId}/export/csv")
    public ResponseEntity<?> exportSessionCsv(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User user = userOpt.get();
        if (user.getRole() == Role.STUDENT) return ResponseEntity.status(403).body("Access denied.");

        Optional<AttendanceSession> sessionOpt = attendanceSessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) return ResponseEntity.notFound().build();
        AttendanceSession session = sessionOpt.get();

        // Determine students based on role
        List<User> students;
        if (user.getRole() == Role.ADMIN) {
            students = userRepository.findByRole(Role.STUDENT);
        } else {
            String dept = user.getDepartment();
            students = (dept == null || dept.isBlank()) ? List.of() :
                    userRepository.findByRoleAndDepartmentIgnoreCase(Role.STUDENT, dept);
        }

        List<Attendance> checkIns = attendanceRepository.findBySessionId(sessionId);
        Optional<User> facultyOpt = session.getFacultyId() != null ? userRepository.findById(session.getFacultyId()) : Optional.empty();
        String facultyName = facultyOpt.map(User::getName).orElse("Unknown");
        String sessionDate = session.getStartTime() != null ? session.getStartTime().toLocalDate().toString() : LocalDate.now().toString();

        StringBuilder csv = new StringBuilder();
        csv.append("Register Number,Student Name,Department,Subject,Faculty,Date,Status,Scan Time\n");

        for (User student : students) {
            Optional<Attendance> record = checkIns.stream()
                    .filter(c -> c.getStudentId().equals(student.getId()))
                    .findFirst();
            String status = record.map(Attendance::getStatus).orElse("ABSENT");
            String scanTime = record.map(a -> a.getTime() != null ? a.getTime().toString() : "").orElse("");
            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                    student.getRegisterNumber() != null ? student.getRegisterNumber() : "Pending",
                    student.getName(), student.getDepartment() != null ? student.getDepartment() : "",
                    session.getSubject() != null ? session.getSubject() : "", facultyName, sessionDate, status, scanTime));
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        String safeSubj = session.getSubject() != null ? session.getSubject().replaceAll("\\s+", "_") : "session";
        headers.setContentDispositionFormData("attachment",
                "attendance_" + safeSubj + "_" + sessionDate + ".csv");
        return ResponseEntity.ok().headers(headers).body(csv.toString());
    }

    // ── PDF Data Export ─────────────────────────────────────────────────────────
    @GetMapping("/session/{sessionId}/export/pdf-data")
    public ResponseEntity<?> exportSessionPdfData(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User user = userOpt.get();
        if (user.getRole() == Role.STUDENT) return ResponseEntity.status(403).body("Access denied.");

        Optional<AttendanceSession> sessionOpt = attendanceSessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) return ResponseEntity.notFound().build();
        AttendanceSession session = sessionOpt.get();

        List<User> students;
        if (user.getRole() == Role.ADMIN) {
            students = userRepository.findByRole(Role.STUDENT);
        } else {
            String dept = user.getDepartment();
            students = (dept == null || dept.isBlank()) ? List.of() :
                    userRepository.findByRoleAndDepartmentIgnoreCase(Role.STUDENT, dept);
        }

        List<Attendance> checkIns = attendanceRepository.findBySessionId(sessionId);
        Optional<User> facultyOpt = session.getFacultyId() != null ? userRepository.findById(session.getFacultyId()) : Optional.empty();

        List<Map<String, Object>> records = new ArrayList<>();
        for (User student : students) {
            Optional<Attendance> record = checkIns.stream()
                    .filter(c -> c.getStudentId().equals(student.getId())).findFirst();
            Map<String, Object> row = new java.util.LinkedHashMap<>();
            row.put("registerNumber", student.getRegisterNumber() != null ? student.getRegisterNumber() : "Pending");
            row.put("studentName", student.getName());
            row.put("department", student.getDepartment() != null ? student.getDepartment() : "");
            row.put("status", record.map(Attendance::getStatus).orElse("ABSENT"));
            row.put("scanTime", record.map(a -> a.getTime() != null ? a.getTime().toString() : "").orElse(""));
            records.add(row);
        }

        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("subject", session.getSubject());
        result.put("faculty", facultyOpt.map(User::getName).orElse("Unknown"));
        result.put("date", session.getStartTime() != null ? session.getStartTime().toLocalDate().toString() : "");
        result.put("startTime", session.getStartTime() != null ? session.getStartTime().toLocalTime().toString() : "");
        result.put("department", facultyOpt.map(User::getDepartment).orElse(""));
        result.put("totalStudents", students.size());
        result.put("presentCount", checkIns.stream().filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus())).count());
        result.put("absentCount", students.size() - checkIns.stream().filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus())).count());
        result.put("records", records);
        return ResponseEntity.ok(result);
    }

    // ── Low Attendance List ──────────────────────────────────────────────────────
    @GetMapping("/analytics/low-attendance")
    public ResponseEntity<?> getLowAttendanceStudents(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User user = userOpt.get();
        if (user.getRole() == Role.STUDENT) return ResponseEntity.status(403).body("Access denied.");
        if (user.getRole() == Role.FACULTY && !user.isClassAdvisor()) {
            return ResponseEntity.status(403).body("Only Class Advisors can monitor low attendance students!");
        }

        List<User> allStudents;
        if (user.getRole() == Role.ADMIN) {
            allStudents = userRepository.findByRole(Role.STUDENT);
        } else {
            String dept = user.getDepartment();
            allStudents = (dept == null || dept.isBlank()) ? List.of() :
                    userRepository.findByRoleAndDepartmentIgnoreCase(Role.STUDENT, dept);
        }

        List<LowAttendanceStudentResponse> result = new ArrayList<>();
        for (User student : allStudents) {
            String dept = student.getDepartment();
            if (dept == null || dept.isBlank()) continue;
            List<User> faculties = userRepository.findByRoleAndDepartmentIgnoreCase(Role.FACULTY, dept);
            if (faculties.isEmpty()) continue;
            List<Long> facultyIds = faculties.stream().map(User::getId).toList();
            List<AttendanceSession> sessions = attendanceSessionRepository.findByFacultyIdIn(facultyIds);
            if (sessions.isEmpty()) continue;

            List<Attendance> attendances = attendanceRepository.findByStudentId(student.getId());
            java.util.Set<Long> presentIds = attendances.stream()
                    .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()))
                    .map(Attendance::getSessionId).collect(java.util.stream.Collectors.toSet());
            java.util.Set<Long> excusedIds = attendances.stream()
                    .filter(a -> "EXCUSED".equalsIgnoreCase(a.getStatus()))
                    .map(Attendance::getSessionId).collect(java.util.stream.Collectors.toSet());

            List<AttendanceSession> countable = sessions.stream().filter(s -> !excusedIds.contains(s.getId())).toList();
            int total = countable.size();
            if (total == 0) continue;
            int present = (int) countable.stream().filter(s -> presentIds.contains(s.getId())).count();
            double pct = (present * 100.0) / total;

            if (pct >= 75.0) continue; // only include low-attendance students

            String alertLevel = pct >= 60.0 ? "WARNING" : "CRITICAL";

            // Subject breakdown
            java.util.Map<String, List<AttendanceSession>> bySubject = countable.stream()
                    .collect(java.util.stream.Collectors.groupingBy(s -> s.getSubject().trim()));
            List<LowAttendanceStudentResponse.SubjectBreakdown> breakdown = bySubject.entrySet().stream()
                    .map(e -> {
                        int subTotal = e.getValue().size();
                        int subPresent = (int) e.getValue().stream().filter(s -> presentIds.contains(s.getId())).count();
                        double subPct = subTotal > 0 ? (subPresent * 100.0) / subTotal : 100.0;
                        return LowAttendanceStudentResponse.SubjectBreakdown.builder()
                                .subject(e.getKey()).percentage(subPct).presentClasses(subPresent).totalClasses(subTotal).build();
                    }).sorted((a, b) -> Double.compare(a.getPercentage(), b.getPercentage())).toList();

            result.add(LowAttendanceStudentResponse.builder()
                    .studentId(student.getId()).studentName(student.getName())
                    .registerNumber(student.getRegisterNumber() != null ? student.getRegisterNumber() : "Pending")
                    .department(dept).overallAttendance(pct).alertLevel(alertLevel).subjectBreakdown(breakdown).build());
        }

        result.sort((a, b) -> Double.compare(a.getOverallAttendance(), b.getOverallAttendance()));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/analytics/faculty")
    public ResponseEntity<?> getFacultyAnalytics(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found!");
        }
        User faculty = userOpt.get();
        if (faculty.getRole() != Role.FACULTY) {
            return ResponseEntity.status(403).body("Only faculty can view faculty analytics!");
        }

        String dept = faculty.getDepartment();
        if (dept == null || dept.trim().isEmpty()) {
            return ResponseEntity.ok(FacultyAnalyticsResponse.builder()
                    .department("N/A")
                    .totalStudents(0)
                    .presentToday(0)
                    .absentToday(0)
                    .averageAttendance(0.0)
                    .topStudents(java.util.Collections.emptyList())
                    .bottomStudents(java.util.Collections.emptyList())
                    .build());
        }

        // Get total students in department
        List<User> students = userRepository.findByRoleAndDepartmentIgnoreCase(Role.STUDENT, dept);
        int totalStudents = students.size();
        java.util.Set<Long> studentIds = students.stream().map(User::getId).collect(java.util.stream.Collectors.toSet());

        // Get all faculty in department
        List<User> faculties = userRepository.findByRoleAndDepartmentIgnoreCase(Role.FACULTY, dept);
        List<Long> facultyIds = faculties.stream().map(User::getId).toList();

        if (facultyIds.isEmpty() || totalStudents == 0) {
            return ResponseEntity.ok(FacultyAnalyticsResponse.builder()
                    .department(dept)
                    .totalStudents(totalStudents)
                    .presentToday(0)
                    .absentToday(0)
                    .averageAttendance(0.0)
                    .topStudents(java.util.Collections.emptyList())
                    .bottomStudents(java.util.Collections.emptyList())
                    .build());
        }

        // Get all sessions conducted by department faculty
        List<AttendanceSession> sessions = attendanceSessionRepository.findByFacultyIdIn(facultyIds);

        // Subject-only restriction for subject faculties
        if (!faculty.isClassAdvisor() && faculty.getRole() != Role.ADMIN) {
            List<FacultyExpertise> expertises = facultyExpertiseRepository.findByFacultyId(faculty.getId());
            List<String> assignedSubjects = expertises.stream()
                .map(fe -> fe.getSubject().getSubjectCode().toLowerCase().trim())
                .toList();

            sessions = sessions.stream()
                .filter(s -> s.getSubject() != null && assignedSubjects.contains(s.getSubject().toLowerCase().trim()))
                .collect(java.util.stream.Collectors.toList());
        }

        List<Long> sessionIds = sessions.stream().map(AttendanceSession::getId).toList();

        // Calculate Present Today & Absent Today
        LocalDate today = LocalDate.now();
        List<AttendanceSession> sessionsToday = sessions.stream()
                .filter(s -> s.getStartTime().toLocalDate().isEqual(today))
                .toList();

        int presentToday = 0;
        int absentToday = 0;

        // Fetch all attendance for sessions in batch
        List<Attendance> allAttendances = sessionIds.isEmpty() ? java.util.Collections.emptyList() : attendanceRepository.findBySessionIdIn(sessionIds);

        if (!sessionsToday.isEmpty()) {
            java.util.Set<Long> attendedStudentIdsToday = new java.util.HashSet<>();
            for (AttendanceSession session : sessionsToday) {
                allAttendances.stream()
                        .filter(r -> r.getSessionId().equals(session.getId()) && "PRESENT".equalsIgnoreCase(r.getStatus()))
                        .map(Attendance::getStudentId)
                        .filter(studentIds::contains)
                        .forEach(attendedStudentIdsToday::add);
            }
            presentToday = attendedStudentIdsToday.size();
            absentToday = Math.max(0, totalStudents - presentToday);
        }

        // Calculate Average Attendance of the department across all sessions
        double averageAttendance = 0.0;
        if (!sessions.isEmpty()) {
            double totalPercentagesSum = 0.0;
            for (AttendanceSession session : sessions) {
                long presentCount = allAttendances.stream()
                        .filter(r -> r.getSessionId().equals(session.getId()) && "PRESENT".equalsIgnoreCase(r.getStatus()))
                        .map(Attendance::getStudentId)
                        .filter(studentIds::contains)
                        .count();
                double sessionPercentage = (presentCount * 100.0) / totalStudents;
                totalPercentagesSum += sessionPercentage;
            }
            averageAttendance = totalPercentagesSum / sessions.size();
        }

        // Top 5 / Bottom 5 Student performance calculation
        List<FacultyAnalyticsResponse.StudentAttendanceRecord> studentRecords = new java.util.ArrayList<>();
        int totalSessionsCount = sessions.size();
        
        for (User student : students) {
            long attendedCount = allAttendances.stream()
                    .filter(a -> a.getStudentId().equals(student.getId()) && "PRESENT".equalsIgnoreCase(a.getStatus()))
                    .count();
            double pct = totalSessionsCount > 0 ? (attendedCount * 100.0) / totalSessionsCount : 100.0;
            
            studentRecords.add(FacultyAnalyticsResponse.StudentAttendanceRecord.builder()
                    .name(student.getName())
                    .registerNumber(student.getRegisterNumber() != null ? student.getRegisterNumber() : "Pending")
                    .attendancePercentage(pct)
                    .build());
        }

        // Top 5: Sort descending by percentage
        List<FacultyAnalyticsResponse.StudentAttendanceRecord> topStudents = studentRecords.stream()
                .sorted((a, b) -> Double.compare(b.getAttendancePercentage(), a.getAttendancePercentage()))
                .limit(5)
                .toList();

        // Bottom 5: Sort ascending by percentage
        List<FacultyAnalyticsResponse.StudentAttendanceRecord> bottomStudents = studentRecords.stream()
                .sorted((a, b) -> Double.compare(a.getAttendancePercentage(), b.getAttendancePercentage()))
                .limit(5)
                .toList();

        return ResponseEntity.ok(FacultyAnalyticsResponse.builder()
                .department(dept)
                .totalStudents(totalStudents)
                .presentToday(presentToday)
                .absentToday(absentToday)
                .averageAttendance(averageAttendance)
                .topStudents(topStudents)
                .bottomStudents(bottomStudents)
                .build());
    }

    @GetMapping("/analytics/admin")
    public ResponseEntity<?> getAdminAnalytics(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found!");
        }
        User user = userOpt.get();
        if (user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("Only admin can view admin analytics!");
        }

        // Total Counts
        long totalStudents = userRepository.findByRole(Role.STUDENT).size();
        long totalFaculty = userRepository.findByRole(Role.FACULTY).size();
        long totalSessions = attendanceSessionRepository.count();

        // Unique Departments
        List<String> departments = userRepository.findAll().stream()
                .map(User::getDepartment)
                .filter(d -> d != null && !d.trim().isEmpty())
                .map(String::trim)
                .distinct()
                .toList();

        List<AdminAnalyticsResponse.DepartmentAnalytics> comparisonList = new java.util.ArrayList<>();

        for (String dept : departments) {
            List<User> students = userRepository.findByRoleAndDepartmentIgnoreCase(Role.STUDENT, dept);
            int deptStudents = students.size();
            if (deptStudents == 0) continue; // skip if no students

            java.util.Set<Long> studentIds = students.stream().map(User::getId).collect(java.util.stream.Collectors.toSet());

            List<User> faculties = userRepository.findByRoleAndDepartmentIgnoreCase(Role.FACULTY, dept);
            List<Long> facultyIds = faculties.stream().map(User::getId).toList();

            if (facultyIds.isEmpty()) {
                comparisonList.add(AdminAnalyticsResponse.DepartmentAnalytics.builder()
                        .department(dept)
                        .averageAttendance(0.0)
                        .totalStudents(deptStudents)
                        .totalSessions(0)
                        .build());
                continue;
            }

            List<AttendanceSession> sessions = attendanceSessionRepository.findByFacultyIdIn(facultyIds);
            int deptSessions = sessions.size();

            double averageAttendance = 0.0;
            if (deptSessions > 0) {
                List<Long> sessionIds = sessions.stream().map(AttendanceSession::getId).toList();
                List<Attendance> records = attendanceRepository.findBySessionIdIn(sessionIds);
                double totalPercentagesSum = 0.0;
                for (AttendanceSession session : sessions) {
                    long presentCount = records.stream()
                            .filter(r -> r.getSessionId().equals(session.getId()) && "PRESENT".equalsIgnoreCase(r.getStatus()))
                            .map(Attendance::getStudentId)
                            .filter(studentIds::contains)
                            .count();
                    double sessionPercentage = (presentCount * 100.0) / deptStudents;
                    totalPercentagesSum += sessionPercentage;
                }
                averageAttendance = totalPercentagesSum / deptSessions;
            }

            comparisonList.add(AdminAnalyticsResponse.DepartmentAnalytics.builder()
                    .department(dept)
                    .averageAttendance(averageAttendance)
                    .totalStudents(deptStudents)
                    .totalSessions(deptSessions)
                    .build());
        }

        // Sort dynamically by department name
        comparisonList.sort((a, b) -> a.getDepartment().compareToIgnoreCase(b.getDepartment()));

        // Find best performing and lowest performing departments
        String bestDept = "None";
        String needsImprovementDept = "None";
        if (!comparisonList.isEmpty()) {
            AdminAnalyticsResponse.DepartmentAnalytics best = comparisonList.stream()
                    .max((a, b) -> Double.compare(a.getAverageAttendance(), b.getAverageAttendance()))
                    .get();
            AdminAnalyticsResponse.DepartmentAnalytics worst = comparisonList.stream()
                    .min((a, b) -> Double.compare(a.getAverageAttendance(), b.getAverageAttendance()))
                    .get();
            bestDept = String.format("%s - %.1f%%", best.getDepartment(), best.getAverageAttendance());
            needsImprovementDept = String.format("%s - %.1f%%", worst.getDepartment(), worst.getAverageAttendance());
        }

        // Build Real Recent Activities list from Database
        List<AdminAnalyticsResponse.ActivityItem> recentActivities = new java.util.ArrayList<>();

        // 1. Recent Attendance Sessions
        List<AttendanceSession> allSess = attendanceSessionRepository.findAll();
        List<AttendanceSession> recentSessions = allSess.stream()
                .filter(s -> s.getStartTime() != null)
                .sorted((a, b) -> b.getStartTime().compareTo(a.getStartTime()))
                .limit(4)
                .toList();

        for (AttendanceSession s : recentSessions) {
            String facName = s.getFacultyName();
            if (s.getFacultyId() != null) {
                facName = userRepository.findById(s.getFacultyId()).map(User::getName).orElse(facName);
            }
            long presentCount = attendanceRepository.findBySessionId(s.getId()).stream()
                    .filter(att -> "PRESENT".equalsIgnoreCase(att.getStatus()) || "LATE".equalsIgnoreCase(att.getStatus()))
                    .count();

            recentActivities.add(AdminAnalyticsResponse.ActivityItem.builder()
                    .id("sess-" + s.getId())
                    .title("Attendance Session Conducted")
                    .details(String.format("Session '%s' by %s (%d signed in)", s.getSubject(), facName != null ? facName : "Faculty", presentCount))
                    .time(formatRelativeTime(s.getStartTime()))
                    .iconType("session")
                    .build());
        }

        // 2. Recent Leave / OD Requests
        List<LeaveRequest> allLeaves = leaveRequestRepository.findAll();
        List<LeaveRequest> recentLeaves = allLeaves.stream()
                .filter(l -> l.getCreatedAt() != null)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(3)
                .toList();

        for (LeaveRequest lr : recentLeaves) {
            String studentName = userRepository.findById(lr.getStudentId()).map(User::getName).orElse("Student");
            recentActivities.add(AdminAnalyticsResponse.ActivityItem.builder()
                    .id("leave-" + lr.getId())
                    .title(String.format("%s Request %s", lr.getType(), lr.getStatus()))
                    .details(String.format("%s request submitted for %s", lr.getType(), studentName))
                    .time(formatRelativeTime(lr.getCreatedAt()))
                    .iconType("leave")
                    .build());
        }

        // 3. Recent Registered Users (Faculty/Students)
        List<User> recentUsers = userRepository.findAll().stream()
                .sorted((a, b) -> Long.compare(b.getId(), a.getId()))
                .limit(3)
                .toList();

        for (User u : recentUsers) {
            String roleTitle = u.getRole() == Role.FACULTY ? "Faculty Account Registered" : "Student Account Registered";
            recentActivities.add(AdminAnalyticsResponse.ActivityItem.builder()
                    .id("user-" + u.getId())
                    .title(roleTitle)
                    .details(String.format("%s registered under %s", u.getName(), u.getDepartment() != null ? u.getDepartment() : "General"))
                    .time("Recently")
                    .iconType("user")
                    .build());
        }

        return ResponseEntity.ok(AdminAnalyticsResponse.builder()
                .totalStudents(totalStudents)
                .totalFaculty(totalFaculty)
                .totalSessions(totalSessions)
                .bestDepartment(bestDept)
                .needsImprovementDepartment(needsImprovementDept)
                .departmentComparison(comparisonList)
                .recentActivities(recentActivities)
                .build());
    }

    private String formatRelativeTime(LocalDateTime dt) {
        if (dt == null) return "Recently";
        long seconds = java.time.Duration.between(dt, LocalDateTime.now()).getSeconds();
        if (seconds < 0) seconds = Math.abs(seconds);
        if (seconds < 60) return "Just now";
        long minutes = seconds / 60;
        if (minutes < 60) return minutes + " mins ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + " hrs ago";
        long days = hours / 24;
        if (days == 1) return "Yesterday";
        if (days < 7) return days + " days ago";
        return dt.toLocalDate().toString();
    }

    @PostMapping("/session/create")
    public ResponseEntity<?> createSessionAlias(
            @Valid @RequestBody StartSessionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return startSession(request, userDetails);
    }

    @GetMapping("/session/{id}")
    public ResponseEntity<?> getSessionById(@PathVariable Long id) {
        Optional<AttendanceSession> sessionOpt = attendanceSessionRepository.findById(id);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        AttendanceSession session = sessionOpt.get();
        populateOtp(session);
        Optional<User> creatorOpt = userRepository.findById(session.getFacultyId());
        session.setFacultyName(creatorOpt.map(User::getName).orElse("Unknown"));
        return ResponseEntity.ok(session);
    }

    @GetMapping("/session/{id}/students")
    public ResponseEntity<?> getSessionStudents(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found!");
        }
        User user = userOpt.get();

        Optional<AttendanceSession> sessionOpt = attendanceSessionRepository.findById(id);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        AttendanceSession session = sessionOpt.get();

        if (user.getRole() == Role.FACULTY) {
            if (!session.getFacultyId().equals(user.getId()) && !user.isClassAdvisor() && !isFacultyAssignedToSubject(user, session.getSubject())) {
                return ResponseEntity.status(403).body("You do not have permission to view this session's attendance records!");
            }
        } else if (user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("Access denied.");
        }

        Optional<User> hostOpt = userRepository.findById(session.getFacultyId());
        List<User> students = new ArrayList<>(getStudentsForSession(session, hostOpt.orElse(user)));

        List<Attendance> attendances = attendanceRepository.findBySessionId(id);
        Set<Long> loadedIds = students.stream().map(User::getId).collect(Collectors.toSet());
        for (Attendance att : attendances) {
            if (att.getStudentId() != null && !loadedIds.contains(att.getStudentId())) {
                userRepository.findById(att.getStudentId()).ifPresent(students::add);
            }
        }

        // Sort students in natural roll number order
        students.sort((u1, u2) -> {
            String r1 = u1.getRegisterNumber() != null ? u1.getRegisterNumber().trim() : "";
            String r2 = u2.getRegisterNumber() != null ? u2.getRegisterNumber().trim() : "";
            if (!r1.isEmpty() && !r2.isEmpty()) {
                return r1.compareToIgnoreCase(r2);
            }
            String n1 = u1.getName() != null ? u1.getName().trim() : "";
            String n2 = u2.getName() != null ? u2.getName().trim() : "";
            return n1.compareToIgnoreCase(n2);
        });

        Map<Long, Attendance> attendanceMap = attendances.stream()
                .collect(Collectors.toMap(Attendance::getStudentId, a -> a, (a1, a2) -> a1));

        List<Map<String, Object>> result = students.stream().map(student -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("studentId", student.getId());
            map.put("name", student.getName());
            map.put("registerNumber", student.getRegisterNumber());
            
            Attendance att = attendanceMap.get(student.getId());
            if (att != null) {
                map.put("status", att.getStatus());
                map.put("qrStatus", "QR".equalsIgnoreCase(att.getMethod()) ? "Checked In" : "Manual");
                map.put("method", att.getMethod() != null ? att.getMethod() : "QR");
                map.put("time", att.getTime());
                map.put("remarks", att.getRemarks());
            } else {
                map.put("status", "PENDING");
                map.put("qrStatus", "Not Checked In");
                map.put("method", null);
                map.put("time", null);
                map.put("remarks", null);
            }
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PostMapping("/session/{id}/manual")
    @Transactional
    public ResponseEntity<?> manualMarkAttendance(
            @PathVariable Long id,
            @RequestBody com.eduflow.dto.ManualMarkRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User user = userOpt.get();

        Optional<AttendanceSession> sessionOpt = attendanceSessionRepository.findById(id);
        if (sessionOpt.isEmpty()) return ResponseEntity.notFound().build();
        AttendanceSession session = sessionOpt.get();

        if (user.getRole() == Role.FACULTY) {
            if (!session.getFacultyId().equals(user.getId()) && !user.isClassAdvisor() && !isFacultyAssignedToSubject(user, session.getSubject())) {
                return ResponseEntity.status(403).body("You do not have permission to modify this session's attendance!");
            }
        } else if (user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("Access denied.");
        }

        Optional<User> studentOpt = userRepository.findById(request.getStudentId());
        if (studentOpt.isEmpty()) return ResponseEntity.badRequest().body("Student not found!");

        List<Attendance> existing = attendanceRepository.findBySessionId(id);
        Optional<Attendance> recordOpt = existing.stream()
                .filter(a -> a.getStudentId().equals(request.getStudentId()))
                .findFirst();

        Attendance attendance;
        if (recordOpt.isPresent()) {
            attendance = recordOpt.get();
            attendance.setStatus(request.getStatus().toUpperCase());
            attendance.setTime(LocalTime.now());
            attendance.setMethod("MANUAL");
        } else {
            attendance = Attendance.builder()
                    .studentId(request.getStudentId())
                    .sessionId(id)
                    .date(LocalDate.now())
                    .time(LocalTime.now())
                    .status(request.getStatus().toUpperCase())
                    .method("MANUAL")
                    .build();
        }

        attendanceRepository.save(attendance);
        return ResponseEntity.ok("Attendance manually marked as " + request.getStatus().toUpperCase() + "!");
    }

    @PostMapping("/session/{id}/bulk-manual")
    @Transactional
    public ResponseEntity<?> bulkManualMarkAttendance(
            @PathVariable Long id,
            @RequestBody List<com.eduflow.dto.ManualMarkRequest> requests,
            @AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User user = userOpt.get();

        Optional<AttendanceSession> sessionOpt = attendanceSessionRepository.findById(id);
        if (sessionOpt.isEmpty()) return ResponseEntity.notFound().build();
        AttendanceSession session = sessionOpt.get();

        if (user.getRole() == Role.FACULTY) {
            if (!session.getFacultyId().equals(user.getId()) && !user.isClassAdvisor() && !isFacultyAssignedToSubject(user, session.getSubject())) {
                return ResponseEntity.status(403).body("You do not have permission to modify this session's attendance!");
            }
        } else if (user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("Access denied.");
        }

        List<Attendance> existing = attendanceRepository.findBySessionId(id);
        Map<Long, Attendance> attendanceMap = existing.stream()
                .collect(Collectors.toMap(Attendance::getStudentId, a -> a));

        List<Attendance> toSave = new ArrayList<>();
        for (com.eduflow.dto.ManualMarkRequest req : requests) {
            Optional<User> studentOpt = userRepository.findById(req.getStudentId());
            if (studentOpt.isEmpty()) continue;

            Attendance att = attendanceMap.get(req.getStudentId());
            if (att != null) {
                att.setStatus(req.getStatus().toUpperCase());
                att.setTime(LocalTime.now());
                att.setMethod("MANUAL");
                att.setRemarks(req.getRemarks());
                toSave.add(att);
            } else {
                toSave.add(Attendance.builder()
                        .studentId(req.getStudentId())
                        .sessionId(id)
                        .date(LocalDate.now())
                        .time(LocalTime.now())
                        .status(req.getStatus().toUpperCase())
                        .method("MANUAL")
                        .remarks(req.getRemarks())
                        .build());
            }
        }

        attendanceRepository.saveAll(toSave);
        return ResponseEntity.ok("Attendance register updated successfully!");
    }

    @PostMapping("/session/save-manual")
    @Transactional
    public ResponseEntity<?> saveManualSession(
            @RequestBody com.eduflow.dto.SaveManualAttendanceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User user = userOpt.get();

        if (user.getRole() != Role.FACULTY && user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("Only faculty or admin can record manual attendance!");
        }

        if (!isFacultyAssignedToSubject(user, request.getSubject())) {
            return ResponseEntity.status(403).body("You do not have permission to record attendance for subject " + request.getSubject() + "!");
        }

        // Determine target department, semester, section
        String targetDept = request.getDepartment();
        Integer targetSem = request.getSemester();
        String targetSec = request.getSection();

        if (targetDept == null || targetDept.trim().isEmpty()) {
            List<CourseClassroom> fClassrooms = classroomRepository.findByFacultyId(user.getId());
            for (CourseClassroom c : fClassrooms) {
                if (c.getSubjectCode().equalsIgnoreCase(request.getSubject().trim())) {
                    targetDept = c.getDepartment();
                    targetSem = c.getSemester();
                    targetSec = c.getSection();
                    break;
                }
            }
        }
        if (targetDept == null || targetDept.trim().isEmpty()) {
            targetDept = user.getDepartment();
        }

        // Parse date and times
        LocalDate localDate = LocalDate.parse(request.getDate());
        LocalTime start = LocalTime.parse(request.getStartTime());
        LocalTime end = LocalTime.parse(request.getEndTime());
        LocalDateTime startDateTime = LocalDateTime.of(localDate, start);
        LocalDateTime endDateTime = LocalDateTime.of(localDate, end);

        // Check if session already exists
        List<AttendanceSession> duplicates = attendanceSessionRepository.findBySubjectIgnoreCaseAndStartTime(request.getSubject(), startDateTime);
        AttendanceSession sessionToUse;
        if (!duplicates.isEmpty()) {
            sessionToUse = duplicates.get(0);
        } else {
            // Deactivate any existing active sessions in this department to maintain a single active session per department
            List<AttendanceSession> activeSessions = attendanceSessionRepository.findByActive(true);
            for (AttendanceSession session : activeSessions) {
                Optional<User> creatorOpt = userRepository.findById(session.getFacultyId());
                if (creatorOpt.isPresent()) {
                    User creator = creatorOpt.get();
                    if (user.getDepartment() != null && user.getDepartment().equalsIgnoreCase(creator.getDepartment())) {
                        session.setActive(false);
                        attendanceSessionRepository.save(session);
                    }
                } else if (session.getFacultyId().equals(user.getId())) {
                    session.setActive(false);
                    attendanceSessionRepository.save(session);
                }
            }

            // Create a new locked (inactive) manual session
            sessionToUse = AttendanceSession.builder()
                    .subject(request.getSubject())
                    .facultyId(user.getId())
                    .department(targetDept)
                    .semester(targetSem)
                    .section(targetSec != null ? targetSec : "A")
                    .startTime(startDateTime)
                    .expiryTime(endDateTime)
                    .active(false)
                    .build();
            attendanceSessionRepository.save(sessionToUse);
        }

        // Get existing attendances for this session to update or insert
        List<Attendance> existing = attendanceRepository.findBySessionId(sessionToUse.getId());
        Map<Long, Attendance> attendanceMap = existing.stream()
                .collect(Collectors.toMap(Attendance::getStudentId, a -> a));

        List<Attendance> toSave = new ArrayList<>();
        for (com.eduflow.dto.ManualMarkRequest req : request.getRecords()) {
            Optional<User> studentOpt = userRepository.findById(req.getStudentId());
            if (studentOpt.isEmpty()) continue;

            Attendance att = attendanceMap.get(req.getStudentId());
            if (att != null) {
                att.setStatus(req.getStatus().toUpperCase());
                att.setTime(start);
                att.setMethod("MANUAL");
                att.setRemarks(req.getRemarks());
                toSave.add(att);
            } else {
                toSave.add(Attendance.builder()
                        .studentId(req.getStudentId())
                        .sessionId(sessionToUse.getId())
                        .date(localDate)
                        .time(start)
                        .status(req.getStatus().toUpperCase())
                        .method("MANUAL")
                        .remarks(req.getRemarks())
                        .build());
            }
        }

        attendanceRepository.saveAll(toSave);
        return ResponseEntity.ok("Manual attendance saved successfully!");
    }

    @PostMapping("/session/{id}/close")
    public ResponseEntity<?> closeSession(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return endSession(id, userDetails);
    }
}
