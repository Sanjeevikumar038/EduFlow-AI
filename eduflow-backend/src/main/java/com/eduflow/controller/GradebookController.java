package com.eduflow.controller;

import com.eduflow.entity.*;
import com.eduflow.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class GradebookController {

    @Autowired
    private StudentAnalyticsService studentAnalyticsService;

    @Autowired
    private FacultyAnalyticsService facultyAnalyticsService;

    @Autowired
    private AdminAnalyticsService adminAnalyticsService;

    @Autowired
    private AIInsightService aiInsightService;

    @Autowired
    private com.eduflow.repository.UserRepository userRepository;

    private User getCurrentUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @GetMapping("/student")
    public ResponseEntity<List<StudentGradeSummary>> getStudentGradebook(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        List<StudentGradeSummary> list = studentAnalyticsService.getAllStudentSummaries(user);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/student/classroom/{classroomId}")
    public ResponseEntity<StudentGradeSummary> getStudentClassroomGrade(
            @PathVariable Long classroomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        StudentGradeSummary summary = studentAnalyticsService.calculateOrGetGradeSummary(user, classroomId);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/student/classroom/{classroomId}/ai-insights")
    public ResponseEntity<StudentAIInsight> getStudentAIInsight(
            @PathVariable Long classroomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        StudentAIInsight insight = aiInsightService.getOrGenerateStudentInsight(user, classroomId);
        return ResponseEntity.ok(insight);
    }

    @GetMapping("/faculty/classroom/{classroomId}")
    public ResponseEntity<Map<String, Object>> getFacultyClassroomAnalytics(
            @PathVariable Long classroomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        Map<String, Object> data = facultyAnalyticsService.getClassroomAnalytics(classroomId, user);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> getAdminERPAnalytics(
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> data = adminAnalyticsService.getAdminERPAnalytics();
        return ResponseEntity.ok(data);
    }
}
