package com.eduflow.service;

import com.eduflow.dto.CareerReadinessResponse;
import java.util.Map;
import java.util.List;

public interface CareerService {
    CareerReadinessResponse getMyCareerReadiness(String userEmail);
    Map<String, Object> getFacultyInsights(String department);
    Map<String, Object> getAdminInsights();
    Map<String, Object> getCareerRecommendations(String userEmail);
    List<com.eduflow.dto.CareerHistoryDto> getHistory(String userEmail);
}
