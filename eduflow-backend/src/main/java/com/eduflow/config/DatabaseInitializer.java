package com.eduflow.config;

import com.eduflow.entity.Role;
import com.eduflow.entity.User;
import com.eduflow.repository.UserRepository;
import com.eduflow.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthService authService;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByEmail("admin").isEmpty()) {
            User admin = User.builder()
                    .name("System Administrator")
                    .email("admin")
                    .password(passwordEncoder.encode("admin@123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("--- System Admin User Initialized successfully: admin / admin@123 ---");
        }

        authService.initializeEmptyRegisterNumbers();
        System.out.println("--- Student Register Numbers Initialized ---");
    }
}
