package com.eduflow.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIAssessmentGenRequest {
    private String title;
    private String topic;
    private String assessmentType; // MCQ, PROGRAMMING, SHORT_ANSWER
    private Integer questionCount;
    private String difficulty; // Easy, Medium, Hard, Mixed
    private Integer marksPerQuestion;
    private Integer durationMinutes;
    private LocalDateTime endTime;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public String getAssessmentType() { return assessmentType; }
    public void setAssessmentType(String assessmentType) { this.assessmentType = assessmentType; }
    public Integer getQuestionCount() { return questionCount; }
    public void setQuestionCount(Integer questionCount) { this.questionCount = questionCount; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public Integer getMarksPerQuestion() { return marksPerQuestion; }
    public void setMarksPerQuestion(Integer marksPerQuestion) { this.marksPerQuestion = marksPerQuestion; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
}



