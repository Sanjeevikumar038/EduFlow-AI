package com.eduflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewAttemptDto {
    private Long id;
    private String domainName;
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
    
    private List<InterviewResponseDto> responses;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDomainName() { return domainName; }
    public void setDomainName(String domainName) { this.domainName = domainName; }
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
    public List<InterviewResponseDto> getResponses() { return responses; }
    public void setResponses(List<InterviewResponseDto> responses) { this.responses = responses; }

    public static InterviewAttemptDtoBuilder builder() { return new InterviewAttemptDtoBuilder(); }
    public static class InterviewAttemptDtoBuilder {
        private Long id;
        private String domainName;
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
        private List<InterviewResponseDto> responses;

        public InterviewAttemptDtoBuilder id(Long id) { this.id = id; return this; }
        public InterviewAttemptDtoBuilder domainName(String domainName) { this.domainName = domainName; return this; }
        public InterviewAttemptDtoBuilder startedAt(LocalDateTime startedAt) { this.startedAt = startedAt; return this; }
        public InterviewAttemptDtoBuilder completedAt(LocalDateTime completedAt) { this.completedAt = completedAt; return this; }
        public InterviewAttemptDtoBuilder status(String status) { this.status = status; return this; }
        public InterviewAttemptDtoBuilder overallScore(Integer overallScore) { this.overallScore = overallScore; return this; }
        public InterviewAttemptDtoBuilder communicationScore(Integer communicationScore) { this.communicationScore = communicationScore; return this; }
        public InterviewAttemptDtoBuilder technicalScore(Integer technicalScore) { this.technicalScore = technicalScore; return this; }
        public InterviewAttemptDtoBuilder confidenceScore(Integer confidenceScore) { this.confidenceScore = confidenceScore; return this; }
        public InterviewAttemptDtoBuilder grammarScore(Integer grammarScore) { this.grammarScore = grammarScore; return this; }
        public InterviewAttemptDtoBuilder fluencyScore(Integer fluencyScore) { this.fluencyScore = fluencyScore; return this; }
        public InterviewAttemptDtoBuilder professionalismScore(Integer professionalismScore) { this.professionalismScore = professionalismScore; return this; }
        public InterviewAttemptDtoBuilder completenessScore(Integer completenessScore) { this.completenessScore = completenessScore; return this; }
        public InterviewAttemptDtoBuilder aiSummary(String aiSummary) { this.aiSummary = aiSummary; return this; }
        public InterviewAttemptDtoBuilder responses(List<InterviewResponseDto> responses) { this.responses = responses; return this; }

        public InterviewAttemptDto build() {
            InterviewAttemptDto dto = new InterviewAttemptDto();
            dto.setId(id); dto.setDomainName(domainName); dto.setStartedAt(startedAt);
            dto.setCompletedAt(completedAt); dto.setStatus(status);
            dto.setOverallScore(overallScore); dto.setCommunicationScore(communicationScore);
            dto.setTechnicalScore(technicalScore); dto.setConfidenceScore(confidenceScore);
            dto.setGrammarScore(grammarScore); dto.setFluencyScore(fluencyScore);
            dto.setProfessionalismScore(professionalismScore); dto.setCompletenessScore(completenessScore);
            dto.setAiSummary(aiSummary); dto.setResponses(responses);
            return dto;
        }
    }
}
