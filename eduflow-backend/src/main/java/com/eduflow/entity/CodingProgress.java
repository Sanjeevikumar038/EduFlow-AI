package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coding_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private User student;

    @Builder.Default
    private Integer easySolved = 0;
    @Builder.Default
    private Integer mediumSolved = 0;
    @Builder.Default
    private Integer hardSolved = 0;
    @Builder.Default
    private Integer totalSolved = 0;

    @Builder.Default
    private Integer totalAttempted = 0;
    @Builder.Default
    private Integer bestScore = 0; // max score achieved on any problem (e.g. 0-100)
    @Builder.Default
    private Double averageScore = 0.0; // average score across all attempts/questions
    @Builder.Default
    private Double successRate = 0.0; // percentage of successful submissions vs total attempts
    @Builder.Default
    private Integer currentStreak = 0; // current consecutive days active
    @Builder.Default
    private Integer longestStreak = 0; // max consecutive days active

    private LocalDateTime lastUpdated;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
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

    public static CodingProgressBuilder builder() { return new CodingProgressBuilder(); }
    public static class CodingProgressBuilder {
        private Long id;
        private User student;
        private Integer easySolved = 0;
        private Integer mediumSolved = 0;
        private Integer hardSolved = 0;
        private Integer totalSolved = 0;
        private Integer totalAttempted = 0;
        private Integer bestScore = 0;
        private Double averageScore = 0.0;
        private Double successRate = 0.0;
        private Integer currentStreak = 0;
        private Integer longestStreak = 0;
        private LocalDateTime lastUpdated = LocalDateTime.now();

        public CodingProgressBuilder id(Long id) { this.id = id; return this; }
        public CodingProgressBuilder student(User student) { this.student = student; return this; }
        public CodingProgressBuilder easySolved(Integer easySolved) { this.easySolved = easySolved; return this; }
        public CodingProgressBuilder mediumSolved(Integer mediumSolved) { this.mediumSolved = mediumSolved; return this; }
        public CodingProgressBuilder hardSolved(Integer hardSolved) { this.hardSolved = hardSolved; return this; }
        public CodingProgressBuilder totalSolved(Integer totalSolved) { this.totalSolved = totalSolved; return this; }
        public CodingProgressBuilder totalAttempted(Integer totalAttempted) { this.totalAttempted = totalAttempted; return this; }
        public CodingProgressBuilder bestScore(Integer bestScore) { this.bestScore = bestScore; return this; }
        public CodingProgressBuilder averageScore(Double averageScore) { this.averageScore = averageScore; return this; }
        public CodingProgressBuilder successRate(Double successRate) { this.successRate = successRate; return this; }
        public CodingProgressBuilder currentStreak(Integer currentStreak) { this.currentStreak = currentStreak; return this; }
        public CodingProgressBuilder longestStreak(Integer longestStreak) { this.longestStreak = longestStreak; return this; }
        public CodingProgressBuilder lastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; return this; }

        public CodingProgress build() {
            CodingProgress p = new CodingProgress();
            p.setId(id); p.setStudent(student);
            if (easySolved != null) p.setEasySolved(easySolved);
            if (mediumSolved != null) p.setMediumSolved(mediumSolved);
            if (hardSolved != null) p.setHardSolved(hardSolved);
            if (totalSolved != null) p.setTotalSolved(totalSolved);
            if (totalAttempted != null) p.setTotalAttempted(totalAttempted);
            if (bestScore != null) p.setBestScore(bestScore);
            if (averageScore != null) p.setAverageScore(averageScore);
            if (successRate != null) p.setSuccessRate(successRate);
            if (currentStreak != null) p.setCurrentStreak(currentStreak);
            if (longestStreak != null) p.setLongestStreak(longestStreak);
            if (lastUpdated != null) p.setLastUpdated(lastUpdated);
            return p;
        }
    }
}
