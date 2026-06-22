package com.eduflow.service;

import com.eduflow.dto.AuthResponse;
import com.eduflow.dto.LoginRequest;
import com.eduflow.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void initializeEmptyRegisterNumbers();
    String generateNextRegisterNumber();
}
