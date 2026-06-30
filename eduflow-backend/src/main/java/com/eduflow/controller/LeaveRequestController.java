package com.eduflow.controller;

import com.eduflow.dto.LeaveRequestDto;
import com.eduflow.entity.*;
import com.eduflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leave")
public class LeaveRequestController {

    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private AttendanceSessionRepository attendanceSessionRepository;
    @Autowired private AttendanceRepository attendanceRepository;

    // ─── Helper: enrich with transient fields ─────────────────────────────────
    private LeaveRequest enrich(LeaveRequest lr) {
        userRepository.findById(lr.getStudentId()).ifPresent(s -> {
            lr.setStudentName(s.getName());
            lr.setRegisterNumber(s.getRegisterNumber() != null ? s.getRegisterNumber() : "Pending");
        });
        if (lr.getFacultyApproverId() != null) {
            userRepository.findById(lr.getFacultyApproverId()).ifPresent(f -> lr.setFacultyName(f.getName()));
        }
        return lr;
    }

    // ─── POST /api/leave — Student submits leave request ─────────────────────
    @PostMapping
    public ResponseEntity<?> submitLeaveRequest(
            @RequestBody LeaveRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User student = userOpt.get();
        if (student.getRole() != Role.STUDENT) return ResponseEntity.status(403).body("Only students can submit leave requests!");

        if (dto.getFromDate() == null || dto.getToDate() == null || dto.getType() == null) {
            return ResponseEntity.badRequest().body("Type, fromDate, and toDate are required.");
        }
        if (dto.getFromDate().isAfter(dto.getToDate())) {
            return ResponseEntity.badRequest().body("fromDate cannot be after toDate.");
        }

        LeaveRequest lr = LeaveRequest.builder()
                .studentId(student.getId())
                .department(student.getDepartment())
                .type(dto.getType())
                .fromDate(dto.getFromDate())
                .toDate(dto.getToDate())
                .reason(dto.getReason())
                .status(LeaveStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        leaveRequestRepository.save(lr);
        return ResponseEntity.ok(enrich(lr));
    }

    // ─── GET /api/leave/my — Student views own requests ───────────────────────
    @GetMapping("/my")
    public ResponseEntity<?> getMyLeaveRequests(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User student = userOpt.get();
        if (student.getRole() != Role.STUDENT) return ResponseEntity.status(403).body("Only students can view own leave requests!");

        List<LeaveRequest> requests = leaveRequestRepository.findByStudentId(student.getId());
        requests.forEach(this::enrich);
        requests.sort((a, b) -> {
            if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });
        return ResponseEntity.ok(requests);
    }

    // ─── GET /api/leave/department — Faculty views dept leave requests ─────────
    @GetMapping("/department")
    public ResponseEntity<?> getDepartmentLeaveRequests(
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User faculty = userOpt.get();
        if (faculty.getRole() != Role.FACULTY) return ResponseEntity.status(403).body("Only faculty can view department leave requests!");

        String dept = faculty.getDepartment();
        if (dept == null || dept.isBlank()) return ResponseEntity.ok(List.of());

        List<LeaveRequest> requests;
        if (status != null && !status.isBlank()) {
            try {
                LeaveStatus ls = LeaveStatus.valueOf(status.toUpperCase());
                requests = leaveRequestRepository.findByDepartmentAndStatus(dept, ls);
            } catch (IllegalArgumentException e) {
                requests = leaveRequestRepository.findByDepartmentIgnoreCase(dept);
            }
        } else {
            requests = leaveRequestRepository.findByDepartmentIgnoreCase(dept);
        }

        requests.forEach(this::enrich);
        requests.sort((a, b) -> {
            if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });
        return ResponseEntity.ok(requests);
    }

    // ─── POST /api/leave/{id}/approve — Faculty approves ─────────────────────
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveLeaveRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User faculty = userOpt.get();
        if (faculty.getRole() != Role.FACULTY && faculty.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("Only faculty or admin can approve leave requests!");
        }

        Optional<LeaveRequest> lrOpt = leaveRequestRepository.findById(id);
        if (lrOpt.isEmpty()) return ResponseEntity.notFound().build();
        LeaveRequest lr = lrOpt.get();

        if (lr.getStatus() != LeaveStatus.PENDING) {
            return ResponseEntity.badRequest().body("Leave request is not in PENDING state.");
        }

        // Validate department match (faculty can only approve same dept)
        if (faculty.getRole() == Role.FACULTY) {
            String dept = faculty.getDepartment();
            if (dept != null && !dept.equalsIgnoreCase(lr.getDepartment())) {
                return ResponseEntity.status(403).body("You can only approve leave requests from your department.");
            }
        }

        lr.setStatus(LeaveStatus.APPROVED);
        lr.setFacultyApproverId(faculty.getId());
        lr.setReviewedAt(LocalDateTime.now());
        leaveRequestRepository.save(lr);

        // Auto-insert EXCUSED attendance records for sessions during leave period
        insertExcusedRecords(lr);

        return ResponseEntity.ok(enrich(lr));
    }

    // ─── POST /api/leave/{id}/reject — Faculty rejects ────────────────────────
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectLeaveRequest(
            @PathVariable Long id,
            @RequestBody(required = false) LeaveRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User faculty = userOpt.get();
        if (faculty.getRole() != Role.FACULTY && faculty.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("Only faculty or admin can reject leave requests!");
        }

        Optional<LeaveRequest> lrOpt = leaveRequestRepository.findById(id);
        if (lrOpt.isEmpty()) return ResponseEntity.notFound().build();
        LeaveRequest lr = lrOpt.get();

        if (lr.getStatus() != LeaveStatus.PENDING) {
            return ResponseEntity.badRequest().body("Leave request is not in PENDING state.");
        }

        if (faculty.getRole() == Role.FACULTY) {
            String dept = faculty.getDepartment();
            if (dept != null && !dept.equalsIgnoreCase(lr.getDepartment())) {
                return ResponseEntity.status(403).body("You can only reject leave requests from your department.");
            }
        }

        lr.setStatus(LeaveStatus.REJECTED);
        lr.setFacultyApproverId(faculty.getId());
        lr.setReviewedAt(LocalDateTime.now());
        if (dto != null && dto.getRejectionReason() != null) {
            lr.setRejectionReason(dto.getRejectionReason());
        }
        leaveRequestRepository.save(lr);
        return ResponseEntity.ok(enrich(lr));
    }

    // ─── GET /api/leave/admin — Admin overview ────────────────────────────────
    @GetMapping("/admin")
    public ResponseEntity<?> getAllLeaveRequests(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User user = userOpt.get();
        if (user.getRole() != Role.ADMIN) return ResponseEntity.status(403).body("Only admin can access this endpoint!");

        List<LeaveRequest> all = leaveRequestRepository.findAll();

        // Apply optional filters
        if (department != null && !department.isBlank() && !department.equalsIgnoreCase("All")) {
            all = all.stream().filter(r -> department.equalsIgnoreCase(r.getDepartment())).collect(Collectors.toList());
        }
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("All")) {
            try {
                LeaveStatus ls = LeaveStatus.valueOf(status.toUpperCase());
                all = all.stream().filter(r -> r.getStatus() == ls).collect(Collectors.toList());
            } catch (IllegalArgumentException ignored) {}
        }

        all.forEach(this::enrich);
        all.sort((a, b) -> {
            if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });
        return ResponseEntity.ok(all);
    }

    // ─── Helper: insert EXCUSED records for sessions during leave period ───────
    private void insertExcusedRecords(LeaveRequest lr) {
        Long studentId = lr.getStudentId();
        LocalDate from = lr.getFromDate();
        LocalDate to = lr.getToDate();

        // Find the student's department
        Optional<User> studentOpt = userRepository.findById(studentId);
        if (studentOpt.isEmpty()) return;
        User student = studentOpt.get();
        String dept = student.getDepartment();
        if (dept == null || dept.isBlank()) return;

        // Find faculty in same department
        List<User> faculties = userRepository.findByRoleAndDepartmentIgnoreCase(Role.FACULTY, dept);
        if (faculties.isEmpty()) return;
        List<Long> facultyIds = faculties.stream().map(User::getId).toList();

        // Find all sessions conducted during leave period
        List<AttendanceSession> sessions = attendanceSessionRepository.findByFacultyIdIn(facultyIds);
        List<AttendanceSession> duringSessions = sessions.stream()
                .filter(s -> {
                    LocalDate sessionDate = s.getStartTime().toLocalDate();
                    return !sessionDate.isBefore(from) && !sessionDate.isAfter(to);
                })
                .toList();

        // Get existing attendance records for student
        List<Attendance> existing = attendanceRepository.findByStudentId(studentId);
        Set<Long> alreadyMarkedSessionIds = existing.stream()
                .map(Attendance::getSessionId)
                .collect(Collectors.toSet());

        // Insert EXCUSED records for sessions not already marked PRESENT
        for (AttendanceSession session : duringSessions) {
            if (!alreadyMarkedSessionIds.contains(session.getId())) {
                Attendance excused = Attendance.builder()
                        .studentId(studentId)
                        .sessionId(session.getId())
                        .date(session.getStartTime().toLocalDate())
                        .time(session.getStartTime().toLocalTime())
                        .status("EXCUSED")
                        .build();
                attendanceRepository.save(excused);
            }
        }
    }
}
