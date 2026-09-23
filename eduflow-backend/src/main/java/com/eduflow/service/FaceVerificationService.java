package com.eduflow.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FaceVerificationService {

    // Map of User Email to Verification Timestamp
    private final Map<String, LocalDateTime> verifiedStudents = new ConcurrentHashMap<>();
    
    // Tokens are valid for 5 minutes (300 seconds)
    private static final long VERIFICATION_VALIDITY_SECONDS = 300;

    public void markVerified(String userEmail) {
        verifiedStudents.put(userEmail, LocalDateTime.now());
    }

    public boolean isVerifiedRecent(String userEmail) {
        LocalDateTime timestamp = verifiedStudents.get(userEmail);
        if (timestamp == null) {
            return false;
        }
        
        // Check if token expired
        if (timestamp.plusSeconds(VERIFICATION_VALIDITY_SECONDS).isBefore(LocalDateTime.now())) {
            verifiedStudents.remove(userEmail); // clean up
            return false;
        }
        
        return true;
    }

    public void clearVerification(String userEmail) {
        verifiedStudents.remove(userEmail);
    }
}
