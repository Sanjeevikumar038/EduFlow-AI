package com.eduflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsResponse {
    private long totalStudents;
    private long totalFaculty;
    private long totalSessions;
    private String bestDepartment;
    private String needsImprovementDepartment;
    private List<DepartmentAnalytics> departmentComparison;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentAnalytics {
        private String department;
        private double averageAttendance;
        private int totalStudents;
        private int totalSessions;
    }
}
