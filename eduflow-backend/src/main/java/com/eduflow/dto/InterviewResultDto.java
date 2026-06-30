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
public class InterviewResultDto {
    private Long id;
    private Integer communicationScore;
    private Integer technicalScore;
    private Integer confidenceScore;
    private Integer overallScore;
    private String feedback;
    private LocalDateTime date;
}
