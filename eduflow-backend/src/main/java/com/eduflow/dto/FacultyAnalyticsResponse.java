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

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getRegisterNumber() { return registerNumber; }
        public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }
        public double getAttendancePercentage() { return attendancePercentage; }
        public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }

        public static StudentAttendanceRecordBuilder builder() { return new StudentAttendanceRecordBuilder(); }
        public static class StudentAttendanceRecordBuilder {
            private String name;
            private String registerNumber;
            private double attendancePercentage;

            public StudentAttendanceRecordBuilder name(String name) { this.name = name; return this; }
            public StudentAttendanceRecordBuilder registerNumber(String registerNumber) { this.registerNumber = registerNumber; return this; }
            public StudentAttendanceRecordBuilder attendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; return this; }

            public StudentAttendanceRecord build() {
                StudentAttendanceRecord r = new StudentAttendanceRecord();
                r.setName(name); r.setRegisterNumber(registerNumber);
                r.setAttendancePercentage(attendancePercentage);
                return r;
            }
        }
    }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public int getTotalStudents() { return totalStudents; }
    public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }
    public int getPresentToday() { return presentToday; }
    public void setPresentToday(int presentToday) { this.presentToday = presentToday; }
    public int getAbsentToday() { return absentToday; }
    public void setAbsentToday(int absentToday) { this.absentToday = absentToday; }
    public double getAverageAttendance() { return averageAttendance; }
    public void setAverageAttendance(double averageAttendance) { this.averageAttendance = averageAttendance; }
    public List<StudentAttendanceRecord> getTopStudents() { return topStudents; }
    public void setTopStudents(List<StudentAttendanceRecord> topStudents) { this.topStudents = topStudents; }
    public List<StudentAttendanceRecord> getBottomStudents() { return bottomStudents; }
    public void setBottomStudents(List<StudentAttendanceRecord> bottomStudents) { this.bottomStudents = bottomStudents; }

    public static FacultyAnalyticsResponseBuilder builder() { return new FacultyAnalyticsResponseBuilder(); }
    public static class FacultyAnalyticsResponseBuilder {
        private String department;
        private int totalStudents;
        private int presentToday;
        private int absentToday;
        private double averageAttendance;
        private List<StudentAttendanceRecord> topStudents;
        private List<StudentAttendanceRecord> bottomStudents;

        public FacultyAnalyticsResponseBuilder department(String department) { this.department = department; return this; }
        public FacultyAnalyticsResponseBuilder totalStudents(int totalStudents) { this.totalStudents = totalStudents; return this; }
        public FacultyAnalyticsResponseBuilder presentToday(int presentToday) { this.presentToday = presentToday; return this; }
        public FacultyAnalyticsResponseBuilder absentToday(int absentToday) { this.absentToday = absentToday; return this; }
        public FacultyAnalyticsResponseBuilder averageAttendance(double averageAttendance) { this.averageAttendance = averageAttendance; return this; }
        public FacultyAnalyticsResponseBuilder topStudents(List<StudentAttendanceRecord> topStudents) { this.topStudents = topStudents; return this; }
        public FacultyAnalyticsResponseBuilder bottomStudents(List<StudentAttendanceRecord> bottomStudents) { this.bottomStudents = bottomStudents; return this; }

        public FacultyAnalyticsResponse build() {
            FacultyAnalyticsResponse r = new FacultyAnalyticsResponse();
            r.setDepartment(department); r.setTotalStudents(totalStudents);
            r.setPresentToday(presentToday); r.setAbsentToday(absentToday);
            r.setAverageAttendance(averageAttendance); r.setTopStudents(topStudents);
            r.setBottomStudents(bottomStudents);
            return r;
        }
    }
}
