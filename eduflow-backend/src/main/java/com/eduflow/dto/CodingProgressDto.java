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
public class CodingProgressDto {
    private Integer easySolved;
    private Integer mediumSolved;
    private Integer hardSolved;
    private Integer totalSolved;
    
    private Integer totalAttempted;
    private Integer bestScore;
    private Double averageScore;
    private Double successRate;
    private Integer currentStreak;
    private Integer longestStreak;

    private LocalDateTime lastUpdated;
}
