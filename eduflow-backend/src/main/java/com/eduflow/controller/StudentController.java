package com.eduflow.controller;

import com.eduflow.dto.CareerReadinessResponse;
import com.eduflow.entity.*;
import com.eduflow.repository.*;
import com.eduflow.service.CareerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private AttendanceSessionRepository attendanceSessionRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private CodingProgressRepository codingProgressRepository;

    @Autowired
    private InterviewAttemptRepository interviewAttemptRepository;

    @Autowired
    private CareerService careerService;

    // GET /api/students with search, filters, sorting, and pagination
    @GetMapping
    public ResponseEntity<?> getStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String batch,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        List<User> students = userRepository.findByRole(Role.STUDENT);

        // Filter
        List<User> filtered = students.stream()
                .filter(s -> {
                    if (search == null || search.trim().isEmpty()) return true;
                    String q = search.toLowerCase().trim();
                    return (s.getName() != null && s.getName().toLowerCase().contains(q)) ||
                           (s.getRegisterNumber() != null && s.getRegisterNumber().toLowerCase().contains(q)) ||
                           (s.getEmail() != null && s.getEmail().toLowerCase().contains(q)) ||
                           (s.getPhone() != null && s.getPhone().toLowerCase().contains(q));
                })
                .filter(s -> department == null || department.trim().isEmpty() || (s.getDepartment() != null && s.getDepartment().equalsIgnoreCase(department.trim())))
                .filter(s -> section == null || section.trim().isEmpty() || (s.getSection() != null && s.getSection().equalsIgnoreCase(section.trim())))
                .filter(s -> batch == null || batch.trim().isEmpty() || (s.getBatch() != null && s.getBatch().equalsIgnoreCase(batch.trim())))
                .filter(s -> active == null || s.isActive() == active)
                .collect(Collectors.toList());

        // Sort
        filtered.sort((s1, s2) -> {
            int comp = 0;
            if ("registerNumber".equals(sortBy)) {
                String r1 = s1.getRegisterNumber() != null ? s1.getRegisterNumber() : "";
                String r2 = s2.getRegisterNumber() != null ? s2.getRegisterNumber() : "";
                comp = r1.compareToIgnoreCase(r2);
            } else if ("department".equals(sortBy)) {
                String d1 = s1.getDepartment() != null ? s1.getDepartment() : "";
                String d2 = s2.getDepartment() != null ? s2.getDepartment() : "";
                comp = d1.compareToIgnoreCase(d2);
            } else { // default by name
                String n1 = s1.getName() != null ? s1.getName() : "";
                String n2 = s2.getName() != null ? s2.getName() : "";
                comp = n1.compareToIgnoreCase(n2);
            }
            return "desc".equalsIgnoreCase(sortDir) ? -comp : comp;
        });

        int totalElements = filtered.size();
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, totalElements);

        List<User> content = new ArrayList<>();
        if (fromIndex < totalElements) {
            content = filtered.subList(fromIndex, toIndex);
        }

        // Map to include attendance % in directory
        List<Map<String, Object>> contentWithDetails = content.stream().map(student -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", student.getId());
            map.put("name", student.getName());
            map.put("registerNumber", student.getRegisterNumber());
            map.put("department", student.getDepartment());
            map.put("semester", student.getSemester());
            map.put("batch", student.getBatch());
            map.put("section", student.getSection());
            map.put("email", student.getEmail());
            map.put("phone", student.getPhone());
            map.put("active", student.isActive());

            // Calc Attendance %
            List<Attendance> attendances = attendanceRepository.findByStudentId(student.getId());
            double attPct = 100.0;
            if (!attendances.isEmpty()) {
                long present = attendances.stream().filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus())).count();
                attPct = (present * 100.0) / attendances.size();
            } else {
                attPct = 0.0; // Avoid default 100% when no records exist
            }
            map.put("attendancePercentage", attPct);
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("content", contentWithDetails);
        response.put("page", page);
        response.put("size", size);
        response.put("totalElements", totalElements);
        response.put("totalPages", (int) Math.ceil((double) totalElements / size));

        return ResponseEntity.ok(response);
    }

    // GET /api/students/{id} for full profile view (stats + history)
    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        Optional<User> requesterOpt = userRepository.findByEmail(userDetails.getUsername());
        if (requesterOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        User requester = requesterOpt.get();

        if (requester.getRole() == Role.STUDENT && !requester.getId().equals(id)) {
            return ResponseEntity.status(403).body("Access denied. You can only view your own profile.");
        }
        if (requester.getRole() == Role.FACULTY && !requester.isClassAdvisor()) {
            return ResponseEntity.status(403).body("Access denied. Only Class Advisors can view student ERP profiles.");
        }

        Optional<User> studentOpt = userRepository.findById(id);
        if (studentOpt.isEmpty() || studentOpt.get().getRole() != Role.STUDENT) {
            return ResponseEntity.notFound().build();
        }

        User student = studentOpt.get();
        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(student.getId());

        // Get Career Readiness Stats
        CareerReadinessResponse careerStats = null;
        try {
            careerStats = careerService.getMyCareerReadiness(student.getEmail());
        } catch (Exception e) {
            // fallback if careerService fails or Groq isn't initialized
        }

        // Attendance stats
        List<Attendance> attendances = attendanceRepository.findByStudentId(student.getId());
        int totalClasses = attendances.size();
        int present = (int) attendances.stream().filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus())).count();
        int absent = (int) attendances.stream().filter(a -> "ABSENT".equalsIgnoreCase(a.getStatus())).count();
        int late = (int) attendances.stream().filter(a -> "LATE".equalsIgnoreCase(a.getStatus())).count();
        int excused = (int) attendances.stream().filter(a -> "EXCUSED".equalsIgnoreCase(a.getStatus())).count();
        double attendancePercentage = totalClasses > 0 ? (present * 100.0) / totalClasses : 0.0;

        // Resume uploaded flag
        boolean resumeUploaded = resumeRepository.findFirstByStudentOrderByUploadedDateDesc(student).isPresent();

        // Interview attempts
        int interviewAttempts = interviewAttemptRepository.findByStudentOrderByStartedAtDesc(student).size();

        // Coding Progress solved count
        int codingSolved = codingProgressRepository.findByStudent(student)
                .map(CodingProgress::getTotalSolved)
                .orElse(0);

        // Attendance History details
        List<Map<String, Object>> attendanceHistoryList = attendances.stream().map(a -> {
            Map<String, Object> record = new LinkedHashMap<>();
            record.put("id", a.getId());
            record.put("date", a.getDate());
            record.put("time", a.getTime());
            record.put("status", a.getStatus());
            record.put("method", a.getMethod() != null ? a.getMethod() : "QR");

            Optional<AttendanceSession> sessionOpt = attendanceSessionRepository.findById(a.getSessionId());
            if (sessionOpt.isPresent()) {
                record.put("subject", sessionOpt.get().getSubject());
            } else {
                record.put("subject", "Unknown");
            }
            return record;
        }).collect(Collectors.toList());

        // Construct response
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("student", student);
        response.put("profile", profileOpt.orElse(null));
        
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("attendancePercentage", attendancePercentage);
        stats.put("totalClasses", totalClasses);
        stats.put("present", present);
        stats.put("absent", absent);
        stats.put("late", late);
        stats.put("excused", excused);
        stats.put("resumeUploaded", resumeUploaded);
        stats.put("interviewAttempts", interviewAttempts);
        stats.put("codingSolved", codingSolved);
        stats.put("careerScore", careerStats != null ? careerStats.getOverallCareerScore() : 0);
        response.put("statistics", stats);

        response.put("attendanceHistory", attendanceHistoryList);

        return ResponseEntity.ok(response);
    }

    // Search students global
    @GetMapping("/search")
    public ResponseEntity<?> searchStudents(@RequestParam String query) {
        List<User> students = userRepository.findByRole(Role.STUDENT);
        String q = query.toLowerCase().trim();
        List<User> result = students.stream()
                .filter(s -> (s.getName() != null && s.getName().toLowerCase().contains(q)) ||
                             (s.getRegisterNumber() != null && s.getRegisterNumber().toLowerCase().contains(q)) ||
                             (s.getEmail() != null && s.getEmail().toLowerCase().contains(q)) ||
                             (s.getPhone() != null && s.getPhone().toLowerCase().contains(q)))
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // Get students by department
    @GetMapping("/department/{department}")
    public ResponseEntity<?> getStudentsByDepartment(@PathVariable String department) {
        List<User> result = userRepository.findByRoleAndDepartmentIgnoreCase(Role.STUDENT, department);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("User not found");
        }
        User user = userOpt.get();
        
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");
        
        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Current password and new password are required.");
        }
        
        // Match current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body("Incorrect current password.");
        }
        
        // Encode and save new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        return ResponseEntity.ok("Password updated successfully!");
    }
}
