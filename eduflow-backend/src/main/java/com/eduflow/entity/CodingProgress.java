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
}
