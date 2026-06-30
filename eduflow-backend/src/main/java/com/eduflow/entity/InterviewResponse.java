package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_responses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private InterviewAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private InterviewQuestion question;

    private Integer questionNumber; // 1 to 5

    @Column(columnDefinition = "TEXT")
    private String transcript;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(columnDefinition = "TEXT")
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
