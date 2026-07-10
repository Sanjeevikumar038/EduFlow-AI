package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coding_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;
    private String studentName;
    private String studentRegisterNumber;
    
    private java.time.LocalDate date;
    
    private String subject; // e.g. "FREE_ACTIVITY"
    private String problemTitle;

    @Column(columnDefinition = "TEXT")
    private String submittedCode;

    private String language;

    @Column(columnDefinition = "TEXT")
    private String testCaseResultsJson; // details of each test case

    private boolean allPassed;

    @Column(columnDefinition = "TEXT")
    private String aiFeedback; // feedback/review generated from Groq

    private Integer score; // e.g. 100 for all passed, 33 for 1/3 passed

    private LocalDateTime submittedAt;
}
