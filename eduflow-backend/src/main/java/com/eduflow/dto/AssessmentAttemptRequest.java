package com.eduflow.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentAttemptRequest {
    private String answersJson; // Formatted JSON string of answers e.g. {"q1": "A", "q2": "text"}
    private boolean isAutoSubmit;

    public String getAnswersJson() { return answersJson; }
    public void setAnswersJson(String answersJson) { this.answersJson = answersJson; }
    public boolean isAutoSubmit() { return isAutoSubmit; }
    public void setAutoSubmit(boolean isAutoSubmit) { this.isAutoSubmit = isAutoSubmit; }
}
