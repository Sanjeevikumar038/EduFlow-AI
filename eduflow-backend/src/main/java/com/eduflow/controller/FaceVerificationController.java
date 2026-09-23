package com.eduflow.controller;

import com.eduflow.service.FaceVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FaceVerificationController {

    private final FaceVerificationService faceVerificationService;

    @PostMapping("/mobile-face-verify")
    public ResponseEntity<?> verifyFace(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().equals("anonymousUser")) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        
        String userEmail = authentication.getName();
        
        // Mark as verified for this student session
        faceVerificationService.markVerified(userEmail);
        
        return ResponseEntity.ok(Map.of(
            "message", "Face verification successful",
            "verifiedUser", userEmail
        ));
    }
}
