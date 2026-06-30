package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(columnDefinition = "TEXT")
    private String question;

    private String questionCategory; // technical, hr, behavioral, mixed

    private String difficulty; // easy, medium, hard

    @Column(columnDefinition = "TEXT")
    private String transcript;

    private Integer duration; // in seconds

    private Integer wordsSpoken;

    private Integer communicationScore;
    private Integer technicalScore;
    private Integer confidenceScore;
    private Integer grammarScore;
    private Integer fluencyScore;
    private Integer overallScore;

    @Column(columnDefinition = "TEXT")
    private String strengths; // JSON

    @Column(columnDefinition = "TEXT")
    private String weaknesses; // JSON

    @Column(columnDefinition = "TEXT")
    private String recommendedResources; // JSON

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(columnDefinition = "TEXT")
    private String aiResponse;

    private LocalDateTime createdAt;
}
