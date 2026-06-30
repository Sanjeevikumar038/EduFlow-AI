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
public class CareerReadinessResponse {
    private Integer attendanceScore;
    private Integer resumeScore;
    private Integer codingScore;
    private Integer interviewScore;
    private Integer overallCareerScore;
    private String status;
    private List<String> recommendations;
    
    // New Interview Metrics
    private Integer lastInterviewScore;
    private Integer bestInterviewScore;
    private Integer interviewStreak;
    private String strongestDomain;
    
    // New counts for dashboard
    private Integer totalMockSessions;
    private Integer totalCodingSolved;
}
