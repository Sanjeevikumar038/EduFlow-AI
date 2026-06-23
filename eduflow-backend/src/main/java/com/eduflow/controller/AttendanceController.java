package com.eduflow.controller;

import com.eduflow.dto.StartSessionRequest;
import com.eduflow.dto.MarkAttendanceRequest;
import com.eduflow.dto.AttendanceRecordResponse;
import com.eduflow.dto.AttendanceReportRecord;
import com.eduflow.entity.AttendanceSession;
import com.eduflow.entity.Attendance;
import com.eduflow.entity.Role;
import com.eduflow.entity.User;
import com.eduflow.repository.AttendanceSessionRepository;
import com.eduflow.repository.AttendanceRepository;
import com.eduflow.repository.UserRepository;
import com.eduflow.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
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

        // Deactivate any existing active sessions for this faculty to maintain a single active session
        List<AttendanceSession> activeSessions = attendanceSessionRepository.findByActive(true);
        for (AttendanceSession session : activeSessions) {
            if (session.getFacultyId().equals(user.getId())) {
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

        // Filter active sessions by facultyId if the user is a Faculty
        if (user.getRole() == Role.FACULTY) {
            Optional<AttendanceSession> facultyActive = activeSessions.stream()
                    .filter(s -> s.getFacultyId().equals(user.getId()))
                    .findFirst();
            
            if (facultyActive.isPresent()) {
                // Double check if it has expired
                AttendanceSession session = facultyActive.get();
                if (LocalDateTime.now().isAfter(session.getExpiryTime())) {
                    session.setActive(false);
                    attendanceSessionRepository.save(session);
                    return ResponseEntity.ok().body(null);
                }
                populateOtp(session);
                return ResponseEntity.ok(session);
            }
            return ResponseEntity.ok().body(null);
        }

        // For Students, return the latest active session overall (so they can scan it)
        if (!activeSessions.isEmpty()) {
            AttendanceSession session = activeSessions.get(activeSessions.size() - 1);
            if (LocalDateTime.now().isAfter(session.getExpiryTime())) {
                session.setActive(false);
                attendanceSessionRepository.save(session);
                return ResponseEntity.ok().body(null);
            }
            populateOtp(session);
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

        // Security check: Only the faculty who started it or an ADMIN can view the records
        if (!session.getFacultyId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("You do not have permission to view records for this session!");
        }

        List<Attendance> records = attendanceRepository.findBySessionId(sessionId);
        List<AttendanceRecordResponse> responseList = records.stream().map(record -> {
            Optional<User> studentOpt = userRepository.findById(record.getStudentId());
            String studentName = studentOpt.map(User::getName).orElse("Unknown");
            String regNo = studentOpt.map(User::getRegisterNumber).orElse("N/A");
            
            return AttendanceRecordResponse.builder()
                    .id(record.getId())
                    .studentId(record.getStudentId())
                    .studentName(studentName)
                    .registerNumber(regNo)
                    .time(record.getTime())
                    .status(record.getStatus())
                    .latitude(record.getLatitude())
                    .longitude(record.getLongitude())
                    .build();
        }).toList();

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
            sessions = attendanceSessionRepository.findAll();
        } else if (user.getRole() == Role.FACULTY) {
            sessions = attendanceSessionRepository.findByFacultyId(user.getId());
        } else {
            return ResponseEntity.status(403).body("Students cannot view all sessions!");
        }

        // Sort latest first
        sessions.sort((s1, s2) -> s2.getId().compareTo(s1.getId()));

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

        if (!session.getFacultyId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("You do not have permission to view this report!");
        }

        // Get all students
        List<User> students = userRepository.findByRole(Role.STUDENT);
        
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
}
