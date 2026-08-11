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

        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }
        public int getPresentClasses() { return presentClasses; }
        public void setPresentClasses(int presentClasses) { this.presentClasses = presentClasses; }
        public int getTotalClasses() { return totalClasses; }
        public void setTotalClasses(int totalClasses) { this.totalClasses = totalClasses; }

        public static SubjectBreakdownBuilder builder() { return new SubjectBreakdownBuilder(); }
        public static class SubjectBreakdownBuilder {
            private String subject;
            private double percentage;
            private int presentClasses;
            private int totalClasses;

            public SubjectBreakdownBuilder subject(String subject) { this.subject = subject; return this; }
            public SubjectBreakdownBuilder percentage(double percentage) { this.percentage = percentage; return this; }
            public SubjectBreakdownBuilder presentClasses(int presentClasses) { this.presentClasses = presentClasses; return this; }
            public SubjectBreakdownBuilder totalClasses(int totalClasses) { this.totalClasses = totalClasses; return this; }

            public SubjectBreakdown build() {
                SubjectBreakdown sb = new SubjectBreakdown();
                sb.setSubject(subject); sb.setPercentage(percentage);
                sb.setPresentClasses(presentClasses); sb.setTotalClasses(totalClasses);
                return sb;
            }
        }
    }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public double getOverallAttendance() { return overallAttendance; }
    public void setOverallAttendance(double overallAttendance) { this.overallAttendance = overallAttendance; }
    public String getAlertLevel() { return alertLevel; }
    public void setAlertLevel(String alertLevel) { this.alertLevel = alertLevel; }
    public List<SubjectBreakdown> getSubjectBreakdown() { return subjectBreakdown; }
    public void setSubjectBreakdown(List<SubjectBreakdown> subjectBreakdown) { this.subjectBreakdown = subjectBreakdown; }

    public static LowAttendanceStudentResponseBuilder builder() { return new LowAttendanceStudentResponseBuilder(); }
    public static class LowAttendanceStudentResponseBuilder {
        private Long studentId;
        private String studentName;
        private String registerNumber;
        private String department;
        private double overallAttendance;
        private String alertLevel;
        private List<SubjectBreakdown> subjectBreakdown;

        public LowAttendanceStudentResponseBuilder studentId(Long studentId) { this.studentId = studentId; return this; }
        public LowAttendanceStudentResponseBuilder studentName(String studentName) { this.studentName = studentName; return this; }
        public LowAttendanceStudentResponseBuilder registerNumber(String registerNumber) { this.registerNumber = registerNumber; return this; }
        public LowAttendanceStudentResponseBuilder department(String department) { this.department = department; return this; }
        public LowAttendanceStudentResponseBuilder overallAttendance(double overallAttendance) { this.overallAttendance = overallAttendance; return this; }
        public LowAttendanceStudentResponseBuilder alertLevel(String alertLevel) { this.alertLevel = alertLevel; return this; }
        public LowAttendanceStudentResponseBuilder subjectBreakdown(List<SubjectBreakdown> subjectBreakdown) { this.subjectBreakdown = subjectBreakdown; return this; }

        public LowAttendanceStudentResponse build() {
            LowAttendanceStudentResponse r = new LowAttendanceStudentResponse();
            r.setStudentId(studentId); r.setStudentName(studentName);
            r.setRegisterNumber(registerNumber); r.setDepartment(department);
            r.setOverallAttendance(overallAttendance); r.setAlertLevel(alertLevel);
            r.setSubjectBreakdown(subjectBreakdown);
            return r;
        }
    }
}
