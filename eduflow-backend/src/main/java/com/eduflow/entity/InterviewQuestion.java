package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domain_id", nullable = false)
    private InterviewDomain domain;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    private String difficulty; // easy, medium, hard

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
