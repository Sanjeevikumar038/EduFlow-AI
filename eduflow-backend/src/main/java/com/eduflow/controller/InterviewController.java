package com.eduflow.controller;

import com.eduflow.dto.*;
import com.eduflow.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interview")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class InterviewController {

    private final InterviewService interviewService;

    @GetMapping("/domains")
    public ResponseEntity<List<InterviewDomainDto>> getDomains() {
        return ResponseEntity.ok(interviewService.getAllDomains());
    }

    @PostMapping("/attempt/start")
    public ResponseEntity<InterviewAttemptDto> startAttempt(Authentication authentication, @RequestBody Map<String, Long> payload) {
        return ResponseEntity.ok(interviewService.startAttempt(authentication.getName(), payload.get("domainId")));
    }

    @PostMapping("/attempt/{attemptId}/response")
    public ResponseEntity<InterviewResponseDto> submitResponse(
            Authentication authentication, 
            @PathVariable Long attemptId, 
            @RequestBody Map<String, Object> payload) {
        Long questionId = Long.valueOf(payload.get("questionId").toString());
        String transcript = (String) payload.get("transcript");
        int questionNumber = (int) payload.get("questionNumber");
        return ResponseEntity.ok(interviewService.submitResponse(authentication.getName(), attemptId, questionId, transcript, questionNumber));
    }

    @PostMapping("/attempt/{attemptId}/complete")
    public ResponseEntity<InterviewAttemptDto> completeAttempt(Authentication authentication, @PathVariable Long attemptId) {
        return ResponseEntity.ok(interviewService.completeAttempt(authentication.getName(), attemptId));
    }

    @GetMapping("/history")
    public ResponseEntity<List<InterviewAttemptDto>> getHistory(Authentication authentication) {
        return ResponseEntity.ok(interviewService.getStudentAttempts(authentication.getName()));
    }
}
