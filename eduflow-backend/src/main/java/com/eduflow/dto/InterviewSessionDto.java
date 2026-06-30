package com.eduflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSessionDto {
    private Long id;
    private String question;
    private String questionCategory;
    private String difficulty;
    private String transcript;
    private Integer duration;
    private Integer wordsSpoken;
    
    private Integer communicationScore;
    private Integer technicalScore;
    private Integer confidenceScore;
    private Integer grammarScore;
    private Integer fluencyScore;
    private Integer overallScore;
    
    private String strengths; // JSON string
    private String weaknesses; // JSON string
    private String recommendedResources; // JSON string
    private String feedback;
    private String aiResponse;
    private LocalDateTime createdAt;
}
