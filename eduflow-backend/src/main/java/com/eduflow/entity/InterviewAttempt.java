package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domain_id", nullable = false)
    private InterviewDomain domain;

    private LocalDateTime startedAt;
    
    private LocalDateTime completedAt;

    private String status; // IN_PROGRESS, COMPLETED

    private Integer overallScore;
    private Integer communicationScore;
    private Integer technicalScore;
    private Integer confidenceScore;
    private Integer grammarScore;
    private Integer fluencyScore;
    private Integer professionalismScore;
    private Integer completenessScore;

    @Column(columnDefinition = "TEXT")
    private String aiSummary;
}
