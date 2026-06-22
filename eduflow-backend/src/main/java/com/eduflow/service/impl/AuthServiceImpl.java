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

        String nextRegisterNum = generateNextRegisterNumber();
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .registerNumber(nextRegisterNum)
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
                .build();
    }

    @Override
    public String generateNextRegisterNumber() {
        List<User> students = userRepository.findByRole(Role.STUDENT);
        int maxSuffix = 0;
        for (User student : students) {
            String regNum = student.getRegisterNumber();
            if (regNum != null && regNum.startsWith("727723euci")) {
                try {
                    int suffix = Integer.parseInt(regNum.substring(10));
                    if (suffix > maxSuffix) {
                        maxSuffix = suffix;
                    }
                } catch (NumberFormatException e) {
                    // Ignore malformed register numbers
                }
            }
        }
        return String.format("727723euci%03d", maxSuffix + 1);
    }

    @Override
    public void initializeEmptyRegisterNumbers() {
        List<User> students = userRepository.findByRole(Role.STUDENT);
        // Sort alphabetically/chronologically by ID so they are assigned in order
        students.sort((u1, u2) -> u1.getId().compareTo(u2.getId()));
        for (User student : students) {
            if (student.getRegisterNumber() == null || student.getRegisterNumber().isEmpty()) {
                student.setRegisterNumber(generateNextRegisterNumber());
                userRepository.save(student);
            }
        }
    }
}
