package com.eduflow.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LowAttendanceStudentResponse {
    private Long studentId;
    private String studentName;
    private String registerNumber;
    private String department;
    private double overallAttendance;
    private String alertLevel; // "WARNING" (60-74%) or "CRITICAL" (<60%)
    private List<SubjectBreakdown> subjectBreakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectBreakdown {
        private String subject;
        private double percentage;
        private int presentClasses;
        private int totalClasses;
    }
}
