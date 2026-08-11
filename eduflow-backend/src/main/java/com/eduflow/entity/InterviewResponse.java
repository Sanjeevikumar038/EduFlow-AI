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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public InterviewAttempt getAttempt() { return attempt; }
    public void setAttempt(InterviewAttempt attempt) { this.attempt = attempt; }
    public InterviewQuestion getQuestion() { return question; }
    public void setQuestion(InterviewQuestion question) { this.question = question; }
    public Integer getQuestionNumber() { return questionNumber; }
    public void setQuestionNumber(Integer questionNumber) { this.questionNumber = questionNumber; }
    public String getTranscript() { return transcript; }
    public void setTranscript(String transcript) { this.transcript = transcript; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public String getIdealAnswer() { return idealAnswer; }
    public void setIdealAnswer(String idealAnswer) { this.idealAnswer = idealAnswer; }
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
    public Integer getOverallScore() { return overallScore; }
    public void setOverallScore(Integer overallScore) { this.overallScore = overallScore; }

    public static InterviewResponseBuilder builder() { return new InterviewResponseBuilder(); }
    public static class InterviewResponseBuilder {
        private Long id;
        private InterviewAttempt attempt;
        private InterviewQuestion question;
        private Integer questionNumber;
        private String transcript;
        private String feedback;
        private String idealAnswer;
        private Integer communicationScore;
        private Integer technicalScore;
        private Integer confidenceScore;
        private Integer grammarScore;
        private Integer fluencyScore;
        private Integer professionalismScore;
        private Integer completenessScore;
        private Integer overallScore;

        public InterviewResponseBuilder id(Long id) { this.id = id; return this; }
        public InterviewResponseBuilder attempt(InterviewAttempt attempt) { this.attempt = attempt; return this; }
        public InterviewResponseBuilder question(InterviewQuestion question) { this.question = question; return this; }
        public InterviewResponseBuilder questionNumber(Integer questionNumber) { this.questionNumber = questionNumber; return this; }
        public InterviewResponseBuilder transcript(String transcript) { this.transcript = transcript; return this; }
        public InterviewResponseBuilder feedback(String feedback) { this.feedback = feedback; return this; }
        public InterviewResponseBuilder idealAnswer(String idealAnswer) { this.idealAnswer = idealAnswer; return this; }
        public InterviewResponseBuilder communicationScore(Integer communicationScore) { this.communicationScore = communicationScore; return this; }
        public InterviewResponseBuilder technicalScore(Integer technicalScore) { this.technicalScore = technicalScore; return this; }
        public InterviewResponseBuilder confidenceScore(Integer confidenceScore) { this.confidenceScore = confidenceScore; return this; }
        public InterviewResponseBuilder grammarScore(Integer grammarScore) { this.grammarScore = grammarScore; return this; }
        public InterviewResponseBuilder fluencyScore(Integer fluencyScore) { this.fluencyScore = fluencyScore; return this; }
        public InterviewResponseBuilder professionalismScore(Integer professionalismScore) { this.professionalismScore = professionalismScore; return this; }
        public InterviewResponseBuilder completenessScore(Integer completenessScore) { this.completenessScore = completenessScore; return this; }
        public InterviewResponseBuilder overallScore(Integer overallScore) { this.overallScore = overallScore; return this; }

        public InterviewResponse build() {
            InterviewResponse r = new InterviewResponse();
            r.setId(id); r.setAttempt(attempt); r.setQuestion(question);
            r.setQuestionNumber(questionNumber); r.setTranscript(transcript);
            r.setFeedback(feedback); r.setIdealAnswer(idealAnswer);
            r.setCommunicationScore(communicationScore); r.setTechnicalScore(technicalScore);
            r.setConfidenceScore(confidenceScore); r.setGrammarScore(grammarScore);
            r.setFluencyScore(fluencyScore); r.setProfessionalismScore(professionalismScore);
            r.setCompletenessScore(completenessScore); r.setOverallScore(overallScore);
            return r;
        }
    }
}
