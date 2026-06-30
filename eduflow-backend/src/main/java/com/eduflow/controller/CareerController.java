package com.eduflow.controller;

import com.eduflow.dto.CareerReadinessResponse;
import com.eduflow.service.CareerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/career")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CareerController {

    private final CareerService careerService;

    @GetMapping("/dashboard")
    public ResponseEntity<CareerReadinessResponse> getCareerDashboard(Authentication authentication) {
        return ResponseEntity.ok(careerService.getMyCareerReadiness(authentication.getName()));
    }

    @PostMapping("/recommendations")
    public ResponseEntity<Map<String, Object>> getCareerRecommendations(Authentication authentication) {
        return ResponseEntity.ok(careerService.getCareerRecommendations(authentication.getName()));
    }

    @GetMapping("/history")
    public ResponseEntity<List<com.eduflow.dto.CareerHistoryDto>> getHistory(Authentication authentication) {
        return ResponseEntity.ok(careerService.getHistory(authentication.getName()));
    }

    @GetMapping("/faculty")
    public ResponseEntity<Map<String, Object>> getFacultyInsights(@RequestParam String department) {
        return ResponseEntity.ok(careerService.getFacultyInsights(department));
    }

    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> getAdminInsights() {
        return ResponseEntity.ok(careerService.getAdminInsights());
    }
}
