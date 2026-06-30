package com.eduflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewResponseDto {
    private Long id;
    private Long attemptId;
    private Long questionId;
    private String questionText;
    private Integer questionNumber;
    private String transcript;
    private String feedback;
    private String idealAnswer;
    private Integer communicationScore;
    private Integer technicalScore;
    private Integer confidenceScore;
    private Integer grammarScore;
    private Integer fluencyScore;
    private Integer professionalismScore;
    private Integer completenessScore;
    private Integer overallScore;
}
