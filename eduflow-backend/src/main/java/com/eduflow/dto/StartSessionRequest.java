package com.eduflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StartSessionRequest {

    @NotBlank(message = "Subject is required")
    private String subject;

    @Min(value = 1, message = "Duration must be at least 1 minute")
    private int durationMinutes;

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }
}
