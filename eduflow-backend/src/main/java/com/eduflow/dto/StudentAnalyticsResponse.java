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
        private String subjectName;
        private String facultyName;
        private double attendancePercentage;
        private int presentClasses;
        private int absentClasses;
        private boolean isLow; // true if below 75%
        private boolean hasActiveSession;
        private Long activeSessionId;
        private String currentOtp;
        private String expiryTime;
        private Integer timeLeftSeconds;

        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getSubjectName() { return subjectName; }
        public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
        public String getFacultyName() { return facultyName; }
        public void setFacultyName(String facultyName) { this.facultyName = facultyName; }
        public double getAttendancePercentage() { return attendancePercentage; }
        public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }
        public int getPresentClasses() { return presentClasses; }
        public void setPresentClasses(int presentClasses) { this.presentClasses = presentClasses; }
        public int getAbsentClasses() { return absentClasses; }
        public void setAbsentClasses(int absentClasses) { this.absentClasses = absentClasses; }
        public boolean isLow() { return isLow; }
        public void setLow(boolean low) { isLow = low; }
        public boolean isHasActiveSession() { return hasActiveSession; }
        public void setHasActiveSession(boolean hasActiveSession) { this.hasActiveSession = hasActiveSession; }
        public Long getActiveSessionId() { return activeSessionId; }
        public void setActiveSessionId(Long activeSessionId) { this.activeSessionId = activeSessionId; }
        public String getCurrentOtp() { return currentOtp; }
        public void setCurrentOtp(String currentOtp) { this.currentOtp = currentOtp; }
        public String getExpiryTime() { return expiryTime; }
        public void setExpiryTime(String expiryTime) { this.expiryTime = expiryTime; }
        public Integer getTimeLeftSeconds() { return timeLeftSeconds; }
        public void setTimeLeftSeconds(Integer timeLeftSeconds) { this.timeLeftSeconds = timeLeftSeconds; }

        public static SubjectAttendanceBuilder builder() { return new SubjectAttendanceBuilder(); }
        public static class SubjectAttendanceBuilder {
            private String subject;
            private String subjectName;
            private String facultyName;
            private double attendancePercentage;
            private int presentClasses;
            private int absentClasses;
            private boolean isLow;
            private boolean hasActiveSession;
            private Long activeSessionId;
            private String currentOtp;
            private String expiryTime;
            private Integer timeLeftSeconds;

            public SubjectAttendanceBuilder subject(String subject) { this.subject = subject; return this; }
            public SubjectAttendanceBuilder subjectName(String subjectName) { this.subjectName = subjectName; return this; }
            public SubjectAttendanceBuilder facultyName(String facultyName) { this.facultyName = facultyName; return this; }
            public SubjectAttendanceBuilder attendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; return this; }
            public SubjectAttendanceBuilder presentClasses(int presentClasses) { this.presentClasses = presentClasses; return this; }
            public SubjectAttendanceBuilder absentClasses(int absentClasses) { this.absentClasses = absentClasses; return this; }
            public SubjectAttendanceBuilder isLow(boolean isLow) { this.isLow = isLow; return this; }
            public SubjectAttendanceBuilder hasActiveSession(boolean hasActiveSession) { this.hasActiveSession = hasActiveSession; return this; }
            public SubjectAttendanceBuilder activeSessionId(Long activeSessionId) { this.activeSessionId = activeSessionId; return this; }
            public SubjectAttendanceBuilder currentOtp(String currentOtp) { this.currentOtp = currentOtp; return this; }
            public SubjectAttendanceBuilder expiryTime(String expiryTime) { this.expiryTime = expiryTime; return this; }
            public SubjectAttendanceBuilder timeLeftSeconds(Integer timeLeftSeconds) { this.timeLeftSeconds = timeLeftSeconds; return this; }

            public SubjectAttendance build() {
                SubjectAttendance sa = new SubjectAttendance();
                sa.setSubject(subject); sa.setSubjectName(subjectName); sa.setFacultyName(facultyName);
                sa.setAttendancePercentage(attendancePercentage);
                sa.setPresentClasses(presentClasses); sa.setAbsentClasses(absentClasses);
                sa.setLow(isLow);
                sa.setHasActiveSession(hasActiveSession);
                sa.setActiveSessionId(activeSessionId);
                sa.setCurrentOtp(currentOtp);
                sa.setExpiryTime(expiryTime);
                sa.setTimeLeftSeconds(timeLeftSeconds);
                return sa;
            }
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceTrend {
        private String date;
        private double percentage;

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }

        public static AttendanceTrendBuilder builder() { return new AttendanceTrendBuilder(); }
        public static class AttendanceTrendBuilder {
            private String date;
            private double percentage;

            public AttendanceTrendBuilder date(String date) { this.date = date; return this; }
            public AttendanceTrendBuilder percentage(double percentage) { this.percentage = percentage; return this; }

            public AttendanceTrend build() {
                AttendanceTrend at = new AttendanceTrend();
                at.setDate(date); at.setPercentage(percentage);
                return at;
            }
        }
    }

    public double getOverallAttendancePercentage() { return overallAttendancePercentage; }
    public void setOverallAttendancePercentage(double overallAttendancePercentage) { this.overallAttendancePercentage = overallAttendancePercentage; }
    public int getPresentClasses() { return presentClasses; }
    public void setPresentClasses(int presentClasses) { this.presentClasses = presentClasses; }
    public int getAbsentClasses() { return absentClasses; }
    public void setAbsentClasses(int absentClasses) { this.absentClasses = absentClasses; }
    public int getExcusedClasses() { return excusedClasses; }
    public void setExcusedClasses(int excusedClasses) { this.excusedClasses = excusedClasses; }
    public String getAttendanceStatus() { return attendanceStatus; }
    public void setAttendanceStatus(String attendanceStatus) { this.attendanceStatus = attendanceStatus; }
    public List<SubjectAttendance> getSubjectWiseAttendance() { return subjectWiseAttendance; }
    public void setSubjectWiseAttendance(List<SubjectAttendance> subjectWiseAttendance) { this.subjectWiseAttendance = subjectWiseAttendance; }
    public List<AttendanceTrend> getAttendanceTrend() { return attendanceTrend; }
    public void setAttendanceTrend(List<AttendanceTrend> attendanceTrend) { this.attendanceTrend = attendanceTrend; }
    public boolean isLowAttendanceWarning() { return lowAttendanceWarning; }
    public void setLowAttendanceWarning(boolean lowAttendanceWarning) { this.lowAttendanceWarning = lowAttendanceWarning; }
    public String getAlertMessage() { return alertMessage; }
    public void setAlertMessage(String alertMessage) { this.alertMessage = alertMessage; }
    public String getAlertLevel() { return alertLevel; }
    public void setAlertLevel(String alertLevel) { this.alertLevel = alertLevel; }

    public static StudentAnalyticsResponseBuilder builder() { return new StudentAnalyticsResponseBuilder(); }
    public static class StudentAnalyticsResponseBuilder {
        private double overallAttendancePercentage;
        private int presentClasses;
        private int absentClasses;
        private int excusedClasses;
        private String attendanceStatus;
        private List<SubjectAttendance> subjectWiseAttendance;
        private List<AttendanceTrend> attendanceTrend;
        private boolean lowAttendanceWarning;
        private String alertMessage;
        private String alertLevel;

        public StudentAnalyticsResponseBuilder overallAttendancePercentage(double overallAttendancePercentage) { this.overallAttendancePercentage = overallAttendancePercentage; return this; }
        public StudentAnalyticsResponseBuilder presentClasses(int presentClasses) { this.presentClasses = presentClasses; return this; }
        public StudentAnalyticsResponseBuilder absentClasses(int absentClasses) { this.absentClasses = absentClasses; return this; }
        public StudentAnalyticsResponseBuilder excusedClasses(int excusedClasses) { this.excusedClasses = excusedClasses; return this; }
        public StudentAnalyticsResponseBuilder attendanceStatus(String attendanceStatus) { this.attendanceStatus = attendanceStatus; return this; }
        public StudentAnalyticsResponseBuilder subjectWiseAttendance(List<SubjectAttendance> subjectWiseAttendance) { this.subjectWiseAttendance = subjectWiseAttendance; return this; }
        public StudentAnalyticsResponseBuilder attendanceTrend(List<AttendanceTrend> attendanceTrend) { this.attendanceTrend = attendanceTrend; return this; }
        public StudentAnalyticsResponseBuilder lowAttendanceWarning(boolean lowAttendanceWarning) { this.lowAttendanceWarning = lowAttendanceWarning; return this; }
        public StudentAnalyticsResponseBuilder alertMessage(String alertMessage) { this.alertMessage = alertMessage; return this; }
        public StudentAnalyticsResponseBuilder alertLevel(String alertLevel) { this.alertLevel = alertLevel; return this; }

        public StudentAnalyticsResponse build() {
            StudentAnalyticsResponse r = new StudentAnalyticsResponse();
            r.setOverallAttendancePercentage(overallAttendancePercentage); r.setPresentClasses(presentClasses);
            r.setAbsentClasses(absentClasses); r.setExcusedClasses(excusedClasses);
            r.setAttendanceStatus(attendanceStatus); r.setSubjectWiseAttendance(subjectWiseAttendance);
            r.setAttendanceTrend(attendanceTrend); r.setLowAttendanceWarning(lowAttendanceWarning);
            r.setAlertMessage(alertMessage); r.setAlertLevel(alertLevel);
            return r;
        }
    }
}
