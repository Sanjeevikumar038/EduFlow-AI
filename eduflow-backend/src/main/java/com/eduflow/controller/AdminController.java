package com.eduflow.controller;

import com.eduflow.dto.FacultyCreateRequest;
import com.eduflow.dto.RegisterRequest;
import com.eduflow.entity.Role;
import com.eduflow.entity.User;
import com.eduflow.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.eduflow.service.AuthService authService;

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
                .department(request.getDepartment())
                .build();

        userRepository.save(faculty);

        return ResponseEntity.ok("Faculty account created successfully for: " + faculty.getEmail());
    }

    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        Optional<User> currentUserOpt = userRepository.findByEmail(userDetails.getUsername());
        if (currentUserOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found!");
        }
        User currentUser = currentUserOpt.get();

        if (currentUser.getRole() == Role.ADMIN) {
            return ResponseEntity.ok(userRepository.findByRole(Role.STUDENT));
        } else if (currentUser.getRole() == Role.FACULTY) {
            String dept = currentUser.getDepartment();
            if (dept == null || dept.trim().isEmpty()) {
                return ResponseEntity.ok(List.of());
            }
            return ResponseEntity.ok(userRepository.findByRoleAndDepartmentIgnoreCase(Role.STUDENT, dept));
        } else {
            return ResponseEntity.status(403).body("Access denied");
        }
    }

    @PostMapping("/create-student")
    public ResponseEntity<?> createStudent(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already registered!");
        }

        String regNum = authService.generateNextRegisterNumber(request.getDepartment());
        User student = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .registerNumber(regNum)
                .department(request.getDepartment())
                .build();

        userRepository.save(student);

        return ResponseEntity.ok("Student account created successfully!");
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    if (user.getRole() != Role.STUDENT) {
                        return ResponseEntity.badRequest().body("User is not a student!");
                    }
                    userRepository.delete(user);
                    return ResponseEntity.ok("Student account deleted successfully!");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/faculty")
    public ResponseEntity<List<User>> getAllFaculty() {
        return ResponseEntity.ok(userRepository.findByRole(Role.FACULTY));
    }

    @DeleteMapping("/faculty/{id}")
    public ResponseEntity<?> deleteFaculty(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    if (user.getRole() != Role.FACULTY) {
                        return ResponseEntity.badRequest().body("User is not a faculty member!");
                    }
                    userRepository.delete(user);
                    return ResponseEntity.ok("Faculty account deleted successfully!");
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
