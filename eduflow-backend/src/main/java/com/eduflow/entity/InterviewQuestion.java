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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public InterviewDomain getDomain() { return domain; }
    public void setDomain(InterviewDomain domain) { this.domain = domain; }
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public static InterviewQuestionBuilder builder() { return new InterviewQuestionBuilder(); }
    public static class InterviewQuestionBuilder {
        private Long id;
        private InterviewDomain domain;
        private String question;
        private String difficulty;
        private Boolean isActive = true;

        public InterviewQuestionBuilder id(Long id) { this.id = id; return this; }
        public InterviewQuestionBuilder domain(InterviewDomain domain) { this.domain = domain; return this; }
        public InterviewQuestionBuilder question(String question) { this.question = question; return this; }
        public InterviewQuestionBuilder difficulty(String difficulty) { this.difficulty = difficulty; return this; }
        public InterviewQuestionBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }

        public InterviewQuestion build() {
            InterviewQuestion q = new InterviewQuestion();
            q.setId(id); q.setDomain(domain); q.setQuestion(question);
            q.setDifficulty(difficulty);
            if (isActive != null) q.setIsActive(isActive);
            return q;
        }
    }
}
