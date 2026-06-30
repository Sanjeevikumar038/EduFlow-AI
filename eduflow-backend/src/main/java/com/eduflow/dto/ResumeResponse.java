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
public class ResumeResponse {
    private Long id;
    private String fileName;
    private LocalDateTime uploadedDate;
    private Integer atsScore;
    private String atsBreakdown;
    private String summary;
    private String strengths;
    private String weaknesses;
    private String skillsFound;
    private String recommendedSkills;
    private String improvementSuggestions;
}
