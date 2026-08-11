package com.eduflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewResponseDto {
    private Long id;
    private Long attemptId;
    private Long questionId;
    private String questionText;
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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAttemptId() { return attemptId; }
    public void setAttemptId(Long attemptId) { this.attemptId = attemptId; }
    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
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

    public static InterviewResponseDtoBuilder builder() { return new InterviewResponseDtoBuilder(); }
    public static class InterviewResponseDtoBuilder {
        private Long id;
        private Long attemptId;
        private Long questionId;
        private String questionText;
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

        public InterviewResponseDtoBuilder id(Long id) { this.id = id; return this; }
        public InterviewResponseDtoBuilder attemptId(Long attemptId) { this.attemptId = attemptId; return this; }
        public InterviewResponseDtoBuilder questionId(Long questionId) { this.questionId = questionId; return this; }
        public InterviewResponseDtoBuilder questionText(String questionText) { this.questionText = questionText; return this; }
        public InterviewResponseDtoBuilder questionNumber(Integer questionNumber) { this.questionNumber = questionNumber; return this; }
        public InterviewResponseDtoBuilder transcript(String transcript) { this.transcript = transcript; return this; }
        public InterviewResponseDtoBuilder feedback(String feedback) { this.feedback = feedback; return this; }
        public InterviewResponseDtoBuilder idealAnswer(String idealAnswer) { this.idealAnswer = idealAnswer; return this; }
        public InterviewResponseDtoBuilder communicationScore(Integer communicationScore) { this.communicationScore = communicationScore; return this; }
        public InterviewResponseDtoBuilder technicalScore(Integer technicalScore) { this.technicalScore = technicalScore; return this; }
        public InterviewResponseDtoBuilder confidenceScore(Integer confidenceScore) { this.confidenceScore = confidenceScore; return this; }
        public InterviewResponseDtoBuilder grammarScore(Integer grammarScore) { this.grammarScore = grammarScore; return this; }
        public InterviewResponseDtoBuilder fluencyScore(Integer fluencyScore) { this.fluencyScore = fluencyScore; return this; }
        public InterviewResponseDtoBuilder professionalismScore(Integer professionalismScore) { this.professionalismScore = professionalismScore; return this; }
        public InterviewResponseDtoBuilder completenessScore(Integer completenessScore) { this.completenessScore = completenessScore; return this; }
        public InterviewResponseDtoBuilder overallScore(Integer overallScore) { this.overallScore = overallScore; return this; }

        public InterviewResponseDto build() {
            InterviewResponseDto dto = new InterviewResponseDto();
            dto.setId(id); dto.setAttemptId(attemptId); dto.setQuestionId(questionId);
            dto.setQuestionText(questionText); dto.setQuestionNumber(questionNumber);
            dto.setTranscript(transcript); dto.setFeedback(feedback);
            dto.setIdealAnswer(idealAnswer); dto.setCommunicationScore(communicationScore);
            dto.setTechnicalScore(technicalScore); dto.setConfidenceScore(confidenceScore);
            dto.setGrammarScore(grammarScore); dto.setFluencyScore(fluencyScore);
            dto.setProfessionalismScore(professionalismScore); dto.setCompletenessScore(completenessScore);
            dto.setOverallScore(overallScore);
            return dto;
        }
    }
}
