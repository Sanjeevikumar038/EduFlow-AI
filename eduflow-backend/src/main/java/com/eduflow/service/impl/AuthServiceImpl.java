package com.eduflow.service.impl;

import com.eduflow.dto.AuthResponse;
import com.eduflow.dto.LoginRequest;
import com.eduflow.dto.RegisterRequest;
import com.eduflow.entity.Role;
import com.eduflow.entity.User;
import com.eduflow.repository.UserRepository;
import com.eduflow.security.CustomUserDetails;
import com.eduflow.security.JwtService;
import com.eduflow.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already registered!");
        }

        String nextRegisterNum = generateNextRegisterNumber(request.getDepartment());
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .registerNumber(nextRegisterNum)
                .department(request.getDepartment())
                .build();

        userRepository.save(user);
        
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String jwtToken = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .role(user.getRole())
                .name(user.getName())
                .registerNumber(user.getRegisterNumber())
                .department(user.getDepartment())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> userRepository.findByName(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email or username: " + request.getEmail())));

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String jwtToken = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .role(user.getRole())
                .name(user.getName())
                .registerNumber(user.getRegisterNumber())
                .department(user.getDepartment())
                .build();
    }

    private String getDeptCode(String department) {
        if (department == null) return "XX";
        String deptUpper = department.trim().toUpperCase();
        
        if (deptUpper.contains("CIVIL")) {
            return "CE";
        } else if (deptUpper.contains("MTECH CSE") || deptUpper.contains("M.TECH CSE") || deptUpper.contains("M.TECH. CSE") || deptUpper.contains("MTECH CSE 5 YEARS")) {
            return "CI";
        } else if (deptUpper.contains("CSE (AI & ML/CYBER SECURITY)") || deptUpper.contains("CSE (AI & ML") || deptUpper.contains("CYBER SECURITY") || deptUpper.contains("CYBERSECURITY")) {
            return "CC";
        } else if (deptUpper.contains("CSE") || deptUpper.contains("COMPUTER SCIENCE")) {
            return "CS";
        } else if (deptUpper.contains("EEE") || deptUpper.contains("ELECTRICAL")) {
            return "EE";
        } else if (deptUpper.contains("ECE") || deptUpper.contains("ELECTRONICS")) {
            return "EC";
        } else if (deptUpper.contains("MECHATRONICS")) {
            return "MT";
        } else if (deptUpper.contains("MECHANICAL")) {
            return "ME";
        } else if (deptUpper.contains("IT") || deptUpper.contains("INFORMATION TECHNOLOGY")) {
            return "IT";
        } else if (deptUpper.contains("AI & DATA SCIENCE") || deptUpper.contains("DATA SCIENCE") || deptUpper.contains("AIDS")) {
            return "AD";
        } else if (deptUpper.contains("CS & BUSINESS SYSTEMS") || deptUpper.contains("BUSINESS SYSTEMS") || deptUpper.contains("CSBS")) {
            return "CB";
        } else {
            String clean = deptUpper.replaceAll("[^A-Z]", "");
            if (clean.length() >= 2) {
                return clean.substring(0, 2);
            }
            return clean.length() == 1 ? clean + "X" : "XX";
        }
    }

    @Override
    public String generateNextRegisterNumber(String department) {
        String deptCode = getDeptCode(department);
        String basePrefix = "727723EU" + deptCode;
        
        List<User> students = userRepository.findByRole(Role.STUDENT);
        int maxSuffix = 0;
        for (User student : students) {
            String regNum = student.getRegisterNumber();
            if (regNum != null && regNum.toUpperCase().startsWith(basePrefix.toUpperCase())) {
                try {
                    int len = regNum.length();
                    if (len >= 3) {
                        int suffix = Integer.parseInt(regNum.substring(len - 3));
                        if (suffix > maxSuffix) {
                            maxSuffix = suffix;
                        }
                    }
                } catch (NumberFormatException e) {
                    // Ignore malformed register numbers
                }
            }
        }
        return String.format("%s%03d", basePrefix, maxSuffix + 1);
    }

    @Override
    public void initializeEmptyRegisterNumbers() {
        List<User> students = userRepository.findByRole(Role.STUDENT);
        students.sort((u1, u2) -> u1.getId().compareTo(u2.getId()));
        for (User student : students) {
            if (student.getRegisterNumber() == null || student.getRegisterNumber().isEmpty()) {
                student.setRegisterNumber(generateNextRegisterNumber(student.getDepartment() != null ? student.getDepartment() : "CSE"));
                userRepository.save(student);
            }
        }
    }
}
