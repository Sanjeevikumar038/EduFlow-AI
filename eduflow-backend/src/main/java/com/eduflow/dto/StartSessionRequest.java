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

    private String department;
    private Integer semester;
    private String section;

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
}
