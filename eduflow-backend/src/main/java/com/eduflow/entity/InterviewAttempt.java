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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public InterviewDomain getDomain() { return domain; }
    public void setDomain(InterviewDomain domain) { this.domain = domain; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getOverallScore() { return overallScore; }
    public void setOverallScore(Integer overallScore) { this.overallScore = overallScore; }
    public Integer getCommunicationScore() { return communicationScore; }
    public void setCommunicationScore(Integer communicationScore) { this.communicationScore = communicationScore; }
    public Integer getTechnicalScore() { return technicalScore; }
    public void setTechnicalScore(Integer technicalScore) { this.technicalScore = technicalScore; }
    public Integer getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Integer confidenceScore) { this.confidenceScore = confidenceScore; }
    public Integer getGrammarScore() { return grammarScore; }
    public void setGrammarScore(Integer grammarScore) { this.grammarScore = grammarScore; }
    public Integer getFluencyScore() { return fluencyScore; }
    public void setFluencyScore(Integer fluencyScore) { this.fluencyScore = fluencyScore; }
    public Integer getProfessionalismScore() { return professionalismScore; }
    public void setProfessionalismScore(Integer professionalismScore) { this.professionalismScore = professionalismScore; }
    public Integer getCompletenessScore() { return completenessScore; }
    public void setCompletenessScore(Integer completenessScore) { this.completenessScore = completenessScore; }
    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }

    public static InterviewAttemptBuilder builder() { return new InterviewAttemptBuilder(); }
    public static class InterviewAttemptBuilder {
        private Long id;
        private User student;
        private InterviewDomain domain;
        private LocalDateTime startedAt;
        private LocalDateTime completedAt;
        private String status;
        private Integer overallScore;
        private Integer communicationScore;
        private Integer technicalScore;
        private Integer confidenceScore;
        private Integer grammarScore;
        private Integer fluencyScore;
        private Integer professionalismScore;
        private Integer completenessScore;
        private String aiSummary;

        public InterviewAttemptBuilder id(Long id) { this.id = id; return this; }
        public InterviewAttemptBuilder student(User student) { this.student = student; return this; }
        public InterviewAttemptBuilder domain(InterviewDomain domain) { this.domain = domain; return this; }
        public InterviewAttemptBuilder startedAt(LocalDateTime startedAt) { this.startedAt = startedAt; return this; }
        public InterviewAttemptBuilder completedAt(LocalDateTime completedAt) { this.completedAt = completedAt; return this; }
        public InterviewAttemptBuilder status(String status) { this.status = status; return this; }
        public InterviewAttemptBuilder overallScore(Integer overallScore) { this.overallScore = overallScore; return this; }
        public InterviewAttemptBuilder communicationScore(Integer communicationScore) { this.communicationScore = communicationScore; return this; }
        public InterviewAttemptBuilder technicalScore(Integer technicalScore) { this.technicalScore = technicalScore; return this; }
        public InterviewAttemptBuilder confidenceScore(Integer confidenceScore) { this.confidenceScore = confidenceScore; return this; }
        public InterviewAttemptBuilder grammarScore(Integer grammarScore) { this.grammarScore = grammarScore; return this; }
        public InterviewAttemptBuilder fluencyScore(Integer fluencyScore) { this.fluencyScore = fluencyScore; return this; }
        public InterviewAttemptBuilder professionalismScore(Integer professionalismScore) { this.professionalismScore = professionalismScore; return this; }
        public InterviewAttemptBuilder completenessScore(Integer completenessScore) { this.completenessScore = completenessScore; return this; }
        public InterviewAttemptBuilder aiSummary(String aiSummary) { this.aiSummary = aiSummary; return this; }

        public InterviewAttempt build() {
            InterviewAttempt i = new InterviewAttempt();
            i.setId(id); i.setStudent(student); i.setDomain(domain);
            i.setStartedAt(startedAt); i.setCompletedAt(completedAt);
            i.setStatus(status); i.setOverallScore(overallScore);
            i.setCommunicationScore(communicationScore); i.setTechnicalScore(technicalScore);
            i.setConfidenceScore(confidenceScore); i.setGrammarScore(grammarScore);
            i.setFluencyScore(fluencyScore); i.setProfessionalismScore(professionalismScore);
            i.setCompletenessScore(completenessScore); i.setAiSummary(aiSummary);
            return i;
        }
    }
}
