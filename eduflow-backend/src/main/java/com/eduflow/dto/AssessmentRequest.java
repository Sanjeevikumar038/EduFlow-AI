package com.eduflow.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentRequest {
    private String title;
    private String description;
    private String assessmentType; // MCQ, PROGRAMMING, SHORT_ANSWER
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private Integer totalMarks;
    private Integer passMarks;
    private boolean shuffleQuestions;
    private boolean shuffleOptions;
    private boolean autoPublishResult;
    private Double negativeMarking;
    private List<AssessmentQuestionDTO> questions;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAssessmentType() { return assessmentType; }
    public void setAssessmentType(String assessmentType) { this.assessmentType = assessmentType; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
    public Integer getPassMarks() { return passMarks; }
    public void setPassMarks(Integer passMarks) { this.passMarks = passMarks; }
    public boolean isShuffleQuestions() { return shuffleQuestions; }
    public void setShuffleQuestions(boolean shuffleQuestions) { this.shuffleQuestions = shuffleQuestions; }
    public boolean isShuffleOptions() { return shuffleOptions; }
    public void setShuffleOptions(boolean shuffleOptions) { this.shuffleOptions = shuffleOptions; }
    public boolean isAutoPublishResult() { return autoPublishResult; }
    public void setAutoPublishResult(boolean autoPublishResult) { this.autoPublishResult = autoPublishResult; }
    public Double getNegativeMarking() { return negativeMarking; }
    public void setNegativeMarking(Double negativeMarking) { this.negativeMarking = negativeMarking; }
    public List<AssessmentQuestionDTO> getQuestions() { return questions; }
    public void setQuestions(List<AssessmentQuestionDTO> questions) { this.questions = questions; }
}
