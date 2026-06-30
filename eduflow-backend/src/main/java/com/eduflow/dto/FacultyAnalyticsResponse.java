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
public class FacultyAnalyticsResponse {
    private String department;
    private int totalStudents;
    private int presentToday;
    private int absentToday;
    private double averageAttendance;
    private List<StudentAttendanceRecord> topStudents;
    private List<StudentAttendanceRecord> bottomStudents;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentAttendanceRecord {
        private String name;
        private String registerNumber;
        private double attendancePercentage;
    }
}
