package com.eduflow.controller;

import com.eduflow.dto.StartSessionRequest;
import com.eduflow.dto.MarkAttendanceRequest;
import com.eduflow.dto.AttendanceRecordResponse;
import com.eduflow.dto.AttendanceReportRecord;
import com.eduflow.dto.StudentAnalyticsResponse;
import com.eduflow.dto.FacultyAnalyticsResponse;
import com.eduflow.dto.AdminAnalyticsResponse;
import com.eduflow.dto.LowAttendanceStudentResponse;
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
import com.eduflow.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

    private void populateOtp(AttendanceSession session) {
        if (session != null) {
            long timeInterval = System.currentTimeMillis() / 10000; // 10 second steps
            session.setCurrentOtp(SecurityUtils.generateOTP(session.getId(), timeInterval));
        }
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

        // Filter active sessions by department if the user is a Student
        if (user.getRole() == Role.STUDENT) {
            String dept = user.getDepartment();
            if (dept != null && !dept.trim().isEmpty()) {
                Optional<AttendanceSession> deptActive = activeSessions.stream()
                        .filter(s -> {
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

        // Verify student department matches faculty department
        Optional<User> facultyOpt = userRepository.findById(session.getFacultyId());
        if (facultyOpt.isPresent()) {
            User faculty = facultyOpt.get();
            if (faculty.getDepartment() != null && student.getDepartment() != null &&
                    !faculty.getDepartment().equalsIgnoreCase(student.getDepartment())) {
                return ResponseEntity.badRequest().body("You cannot mark attendance for a class in a different department (" + faculty.getDepartment() + ")!");
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
            if (dept == null || dept.trim().isEmpty()) {
                sessions = new java.util.ArrayList<>(attendanceSessionRepository.findByFacultyId(user.getId()));
            } else {
                List<User> departmentFaculties = userRepository.findByRoleAndDepartmentIgnoreCase(Role.FACULTY, dept);
                List<Long> facultyIds = departmentFaculties.stream().map(User::getId).toList();
                if (facultyIds.isEmpty()) {
                    sessions = new java.util.ArrayList<>();
                } else {
                    sessions = new java.util.ArrayList<>(attendanceSessionRepository.findByFacultyIdIn(facultyIds));
                }
            }
        } else {
            return ResponseEntity.status(403).body("Students cannot view all sessions!");
        }

        // Sort latest first
        sessions.sort((s1, s2) -> s2.getId().compareTo(s1.getId()));

        // Populate conductor/faculty names for frontend
        for (AttendanceSession s : sessions) {
            Optional<User> fOpt = userRepository.findById(s.getFacultyId());
            s.setFacultyName(fOpt.map(User::getName).orElse("Unknown"));
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
            return ResponseEntity.status(403).body("You do not have permission to view this report!");
        }

        // Get students based on role and department
        List<User> students;
        if (user.getRole() == Role.ADMIN) {
            students = userRepository.findByRole(Role.STUDENT);
        } else if (user.getRole() == Role.FACULTY) {
            String dept = user.getDepartment();
            if (dept == null || dept.trim().isEmpty()) {
                students = List.of();
            } else {
                students = userRepository.findByRoleAndDepartmentIgnoreCase(Role.STUDENT, dept);
            }
        } else {
            return ResponseEntity.status(403).body("Students cannot view this report!");
        }
        
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
        if (dept == null || dept.trim().isEmpty()) {
            return ResponseEntity.ok(StudentAnalyticsResponse.builder()
                    .overallAttendancePercentage(0.0).presentClasses(0).absentClasses(0).excusedClasses(0)
                    .attendanceStatus("Needs Improvement").lowAttendanceWarning(false).alertLevel("NORMAL")
                    .subjectWiseAttendance(java.util.Collections.emptyList())
                    .attendanceTrend(java.util.Collections.emptyList()).build());
        }

        // Get all faculty in student's department
        List<User> faculties = userRepository.findByRoleAndDepartmentIgnoreCase(Role.FACULTY, dept);
        List<Long> facultyIds = faculties.stream().map(User::getId).toList();

        if (facultyIds.isEmpty()) {
            return ResponseEntity.ok(StudentAnalyticsResponse.builder()
                    .overallAttendancePercentage(0.0).presentClasses(0).absentClasses(0).excusedClasses(0)
                    .attendanceStatus("Needs Improvement").lowAttendanceWarning(false).alertLevel("NORMAL")
                    .subjectWiseAttendance(java.util.Collections.emptyList())
                    .attendanceTrend(java.util.Collections.emptyList()).build());
        }

        // Get all sessions conducted by these faculty
        List<AttendanceSession> sessions = attendanceSessionRepository.findByFacultyIdIn(facultyIds);

        // Get all attendance records for this student
        List<Attendance> attendances = attendanceRepository.findByStudentId(student.getId());
        java.util.Set<Long> attendedSessionIds = attendances.stream()
                .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()))
                .map(Attendance::getSessionId)
                .collect(java.util.stream.Collectors.toSet());
        java.util.Set<Long> excusedSessionIds = attendances.stream()
                .filter(a -> "EXCUSED".equalsIgnoreCase(a.getStatus()))
                .map(Attendance::getSessionId)
                .collect(java.util.stream.Collectors.toSet());

        // Only count sessions that are neither excused as absent
        List<AttendanceSession> countableSessions = sessions.stream()
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

        // Low-attendance alert
        boolean lowWarning = overallPercentage < 75.0;
        String alertLevel = overallPercentage >= 75.0 ? "NORMAL" : overallPercentage >= 60.0 ? "WARNING" : "CRITICAL";
        String alertMessage = null;
        if ("CRITICAL".equals(alertLevel)) {
            alertMessage = String.format("⛔ CRITICAL: Your attendance is %.1f%% — well below the required 75%%. Immediate action required!", overallPercentage);
        } else if ("WARNING".equals(alertLevel)) {
            alertMessage = String.format("⚠ WARNING: Your attendance is %.1f%% — approaching the 75%% minimum threshold. Attend classes regularly to avoid detention.", overallPercentage);
        }

        // Group by subject — use countable sessions
        java.util.Map<String, List<AttendanceSession>> subjectSessions = countableSessions.stream()
                .collect(java.util.stream.Collectors.groupingBy(s -> s.getSubject().trim()));

        List<StudentAnalyticsResponse.SubjectAttendance> subjectStats = subjectSessions.entrySet().stream()
                .map(entry -> {
                    String subject = entry.getKey();
                    List<AttendanceSession> sList = entry.getValue();
                    int subTotal = sList.size();
                    int subPresent = (int) sList.stream().filter(s -> attendedSessionIds.contains(s.getId())).count();
                    int subAbsent = subTotal - subPresent;
                    double subPercentage = subTotal > 0 ? (subPresent * 100.0) / subTotal : 100.0;
                    return StudentAnalyticsResponse.SubjectAttendance.builder()
                            .subject(subject).attendancePercentage(subPercentage)
                            .presentClasses(subPresent).absentClasses(subAbsent)
                            .isLow(subPercentage < 75.0).build();
                })
                .sorted((a, b) -> a.getSubject().compareToIgnoreCase(b.getSubject()))
                .toList();

        // Trend by date
        java.util.Map<LocalDate, List<AttendanceSession>> dateSessions = countableSessions.stream()
                .collect(java.util.stream.Collectors.groupingBy(s -> s.getStartTime().toLocalDate()));

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
        Optional<User> facultyOpt = userRepository.findById(session.getFacultyId());
        String facultyName = facultyOpt.map(User::getName).orElse("Unknown");
        String sessionDate = session.getStartTime().toLocalDate().toString();

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
                    session.getSubject(), facultyName, sessionDate, status, scanTime));
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment",
                "attendance_" + session.getSubject().replaceAll("\\s+", "_") + "_" + sessionDate + ".csv");
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
        Optional<User> facultyOpt = userRepository.findById(session.getFacultyId());

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
        result.put("date", session.getStartTime().toLocalDate().toString());
        result.put("startTime", session.getStartTime().toLocalTime().toString());
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

        return ResponseEntity.ok(AdminAnalyticsResponse.builder()
                .totalStudents(totalStudents)
                .totalFaculty(totalFaculty)
                .totalSessions(totalSessions)
                .bestDepartment(bestDept)
                .needsImprovementDepartment(needsImprovementDept)
                .departmentComparison(comparisonList)
                .build());
    }
}
