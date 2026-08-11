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

    public Integer getEasySolved() { return easySolved; }
    public void setEasySolved(Integer easySolved) { this.easySolved = easySolved; }
    public Integer getMediumSolved() { return mediumSolved; }
    public void setMediumSolved(Integer mediumSolved) { this.mediumSolved = mediumSolved; }
    public Integer getHardSolved() { return hardSolved; }
    public void setHardSolved(Integer hardSolved) { this.hardSolved = hardSolved; }
    public Integer getTotalSolved() { return totalSolved; }
    public void setTotalSolved(Integer totalSolved) { this.totalSolved = totalSolved; }
    public Integer getTotalAttempted() { return totalAttempted; }
    public void setTotalAttempted(Integer totalAttempted) { this.totalAttempted = totalAttempted; }
    public Integer getBestScore() { return bestScore; }
    public void setBestScore(Integer bestScore) { this.bestScore = bestScore; }
    public Double getAverageScore() { return averageScore; }
    public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }
    public Double getSuccessRate() { return successRate; }
    public void setSuccessRate(Double successRate) { this.successRate = successRate; }
    public Integer getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }
    public Integer getLongestStreak() { return longestStreak; }
    public void setLongestStreak(Integer longestStreak) { this.longestStreak = longestStreak; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    public static CodingProgressDtoBuilder builder() { return new CodingProgressDtoBuilder(); }
    public static class CodingProgressDtoBuilder {
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

        public CodingProgressDtoBuilder easySolved(Integer easySolved) { this.easySolved = easySolved; return this; }
        public CodingProgressDtoBuilder mediumSolved(Integer mediumSolved) { this.mediumSolved = mediumSolved; return this; }
        public CodingProgressDtoBuilder hardSolved(Integer hardSolved) { this.hardSolved = hardSolved; return this; }
        public CodingProgressDtoBuilder totalSolved(Integer totalSolved) { this.totalSolved = totalSolved; return this; }
        public CodingProgressDtoBuilder totalAttempted(Integer totalAttempted) { this.totalAttempted = totalAttempted; return this; }
        public CodingProgressDtoBuilder bestScore(Integer bestScore) { this.bestScore = bestScore; return this; }
        public CodingProgressDtoBuilder averageScore(Double averageScore) { this.averageScore = averageScore; return this; }
        public CodingProgressDtoBuilder successRate(Double successRate) { this.successRate = successRate; return this; }
        public CodingProgressDtoBuilder currentStreak(Integer currentStreak) { this.currentStreak = currentStreak; return this; }
        public CodingProgressDtoBuilder longestStreak(Integer longestStreak) { this.longestStreak = longestStreak; return this; }
        public CodingProgressDtoBuilder lastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; return this; }

        public CodingProgressDto build() {
            CodingProgressDto dto = new CodingProgressDto();
            dto.setEasySolved(easySolved); dto.setMediumSolved(mediumSolved);
            dto.setHardSolved(hardSolved); dto.setTotalSolved(totalSolved);
            dto.setTotalAttempted(totalAttempted); dto.setBestScore(bestScore);
            dto.setAverageScore(averageScore); dto.setSuccessRate(successRate);
            dto.setCurrentStreak(currentStreak); dto.setLongestStreak(longestStreak);
            dto.setLastUpdated(lastUpdated);
            return dto;
        }
    }
}
