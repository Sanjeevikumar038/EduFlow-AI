package com.eduflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAnalyticsResponse {
    private double overallAttendancePercentage;
    private int presentClasses;
    private int absentClasses;
    private int excusedClasses;
    private String attendanceStatus;
    private List<SubjectAttendance> subjectWiseAttendance;
    private List<AttendanceTrend> attendanceTrend;

    // Low-attendance alert fields
    private boolean lowAttendanceWarning;
    private String alertMessage;
    private String alertLevel; // "NORMAL", "WARNING", "CRITICAL"

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectAttendance {
        private String subject;
        private double attendancePercentage;
        private int presentClasses;
        private int absentClasses;
        private boolean isLow; // true if below 75%
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceTrend {
        private String date;
        private double percentage;
    }
}
