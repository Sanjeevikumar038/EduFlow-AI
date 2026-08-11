package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assessment_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = false)
    private ClassroomAssessment assessment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Builder.Default
    private LocalDateTime startedAt = LocalDateTime.now();

    private LocalDateTime submittedAt;

    @Builder.Default
    private Double totalScore = 0.0;

    // IN_PROGRESS, SUBMITTED, AUTO_SUBMITTED, GRADED
    @Builder.Default
    private String status = "IN_PROGRESS";

    @Column(columnDefinition = "TEXT")
    private String answersJson; // JSON array of student responses per question

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "graded_by_id")
    private User gradedBy;

    private LocalDateTime gradedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ClassroomAssessment getAssessment() { return assessment; }
    public void setAssessment(ClassroomAssessment assessment) { this.assessment = assessment; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public Double getTotalScore() { return totalScore; }
    public void setTotalScore(Double totalScore) { this.totalScore = totalScore; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAnswersJson() { return answersJson; }
    public void setAnswersJson(String answersJson) { this.answersJson = answersJson; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public User getGradedBy() { return gradedBy; }
    public void setGradedBy(User gradedBy) { this.gradedBy = gradedBy; }
    public LocalDateTime getGradedAt() { return gradedAt; }
    public void setGradedAt(LocalDateTime gradedAt) { this.gradedAt = gradedAt; }

    public static AssessmentAttemptBuilder builder() { return new AssessmentAttemptBuilder(); }
    public static class AssessmentAttemptBuilder {
        private Long id;
        private ClassroomAssessment assessment;
        private User student;
        private LocalDateTime startedAt = LocalDateTime.now();
        private LocalDateTime submittedAt;
        private Double totalScore = 0.0;
        private String status = "IN_PROGRESS";
        private String answersJson;
        private String feedback;
        private User gradedBy;
        private LocalDateTime gradedAt;

        public AssessmentAttemptBuilder id(Long id) { this.id = id; return this; }
        public AssessmentAttemptBuilder assessment(ClassroomAssessment assessment) { this.assessment = assessment; return this; }
        public AssessmentAttemptBuilder student(User student) { this.student = student; return this; }
        public AssessmentAttemptBuilder startedAt(LocalDateTime startedAt) { this.startedAt = startedAt; return this; }
        public AssessmentAttemptBuilder submittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; return this; }
        public AssessmentAttemptBuilder totalScore(Double totalScore) { this.totalScore = totalScore; return this; }
        public AssessmentAttemptBuilder status(String status) { this.status = status; return this; }
        public AssessmentAttemptBuilder answersJson(String answersJson) { this.answersJson = answersJson; return this; }
        public AssessmentAttemptBuilder feedback(String feedback) { this.feedback = feedback; return this; }
        public AssessmentAttemptBuilder gradedBy(User gradedBy) { this.gradedBy = gradedBy; return this; }
        public AssessmentAttemptBuilder gradedAt(LocalDateTime gradedAt) { this.gradedAt = gradedAt; return this; }

        public AssessmentAttempt build() {
            AssessmentAttempt a = new AssessmentAttempt();
            a.setId(id); a.setAssessment(assessment); a.setStudent(student);
            if (startedAt != null) a.setStartedAt(startedAt);
            a.setSubmittedAt(submittedAt);
            if (totalScore != null) a.setTotalScore(totalScore);
            if (status != null) a.setStatus(status);
            a.setAnswersJson(answersJson); a.setFeedback(feedback);
            a.setGradedBy(gradedBy); a.setGradedAt(gradedAt);
            return a;
        }
    }
}
