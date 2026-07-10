package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_question_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"studentId", "questionBankId"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentQuestionProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long studentId;

    @Column(nullable = false)
    private Long questionBankId;

    private boolean passed;

    private int attempts;

    private int bestScore; // 0 to 100 (percentage of test cases passed)

    private LocalDateTime solvedDate;

    private LocalDateTime lastAttempted;
}
