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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getQuestionBankId() { return questionBankId; }
    public void setQuestionBankId(Long questionBankId) { this.questionBankId = questionBankId; }
    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }
    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) { this.attempts = attempts; }
    public int getBestScore() { return bestScore; }
    public void setBestScore(int bestScore) { this.bestScore = bestScore; }
    public LocalDateTime getSolvedDate() { return solvedDate; }
    public void setSolvedDate(LocalDateTime solvedDate) { this.solvedDate = solvedDate; }
    public LocalDateTime getLastAttempted() { return lastAttempted; }
    public void setLastAttempted(LocalDateTime lastAttempted) { this.lastAttempted = lastAttempted; }

    public static StudentQuestionProgressBuilder builder() { return new StudentQuestionProgressBuilder(); }
    public static class StudentQuestionProgressBuilder {
        private Long id;
        private Long studentId;
        private Long questionBankId;
        private boolean passed;
        private int attempts;
        private int bestScore;
        private LocalDateTime solvedDate;
        private LocalDateTime lastAttempted;

        public StudentQuestionProgressBuilder id(Long id) { this.id = id; return this; }
        public StudentQuestionProgressBuilder studentId(Long studentId) { this.studentId = studentId; return this; }
        public StudentQuestionProgressBuilder questionBankId(Long questionBankId) { this.questionBankId = questionBankId; return this; }
        public StudentQuestionProgressBuilder passed(boolean passed) { this.passed = passed; return this; }
        public StudentQuestionProgressBuilder attempts(int attempts) { this.attempts = attempts; return this; }
        public StudentQuestionProgressBuilder bestScore(int bestScore) { this.bestScore = bestScore; return this; }
        public StudentQuestionProgressBuilder solvedDate(LocalDateTime solvedDate) { this.solvedDate = solvedDate; return this; }
        public StudentQuestionProgressBuilder lastAttempted(LocalDateTime lastAttempted) { this.lastAttempted = lastAttempted; return this; }

        public StudentQuestionProgress build() {
            StudentQuestionProgress p = new StudentQuestionProgress();
            p.setId(id); p.setStudentId(studentId); p.setQuestionBankId(questionBankId);
            p.setPassed(passed); p.setAttempts(attempts); p.setBestScore(bestScore);
            p.setSolvedDate(solvedDate); p.setLastAttempted(lastAttempted);
            return p;
        }
    }
}
