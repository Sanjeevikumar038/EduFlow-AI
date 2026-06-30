package com.eduflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewAttemptDto {
    private Long id;
    private String domainName;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String status;
    private Integer overallScore;
    private Integer communicationScore;
    private Integer technicalScore;
    private Integer confidenceScore;
    private Integer grammarScore;
    private Integer fluencyScore;
    private Integer professionalismScore;
    private Integer completenessScore;
    
    private String aiSummary;
    
    private List<InterviewResponseDto> responses;
}
