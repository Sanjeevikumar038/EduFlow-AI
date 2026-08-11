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
public class AdminAnalyticsResponse {
    private long totalStudents;
    private long totalFaculty;
    private long totalSessions;
    private String bestDepartment;
    private String needsImprovementDepartment;
    private List<DepartmentAnalytics> departmentComparison;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentAnalytics {
        private String department;
        private double averageAttendance;
        private int totalStudents;
        private int totalSessions;

        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public double getAverageAttendance() { return averageAttendance; }
        public void setAverageAttendance(double averageAttendance) { this.averageAttendance = averageAttendance; }
        public int getTotalStudents() { return totalStudents; }
        public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }
        public int getTotalSessions() { return totalSessions; }
        public void setTotalSessions(int totalSessions) { this.totalSessions = totalSessions; }

        public static DepartmentAnalyticsBuilder builder() { return new DepartmentAnalyticsBuilder(); }
        public static class DepartmentAnalyticsBuilder {
            private String department;
            private double averageAttendance;
            private int totalStudents;
            private int totalSessions;

            public DepartmentAnalyticsBuilder department(String department) { this.department = department; return this; }
            public DepartmentAnalyticsBuilder averageAttendance(double averageAttendance) { this.averageAttendance = averageAttendance; return this; }
            public DepartmentAnalyticsBuilder totalStudents(int totalStudents) { this.totalStudents = totalStudents; return this; }
            public DepartmentAnalyticsBuilder totalSessions(int totalSessions) { this.totalSessions = totalSessions; return this; }

            public DepartmentAnalytics build() {
                DepartmentAnalytics da = new DepartmentAnalytics();
                da.setDepartment(department); da.setAverageAttendance(averageAttendance);
                da.setTotalStudents(totalStudents); da.setTotalSessions(totalSessions);
                return da;
            }
        }
    }

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }
    public long getTotalFaculty() { return totalFaculty; }
    public void setTotalFaculty(long totalFaculty) { this.totalFaculty = totalFaculty; }
    public long getTotalSessions() { return totalSessions; }
    public void setTotalSessions(long totalSessions) { this.totalSessions = totalSessions; }
    public String getBestDepartment() { return bestDepartment; }
    public void setBestDepartment(String bestDepartment) { this.bestDepartment = bestDepartment; }
    public String getNeedsImprovementDepartment() { return needsImprovementDepartment; }
    public void setNeedsImprovementDepartment(String needsImprovementDepartment) { this.needsImprovementDepartment = needsImprovementDepartment; }
    public List<DepartmentAnalytics> getDepartmentComparison() { return departmentComparison; }
    public void setDepartmentComparison(List<DepartmentAnalytics> departmentComparison) { this.departmentComparison = departmentComparison; }

    public static AdminAnalyticsResponseBuilder builder() { return new AdminAnalyticsResponseBuilder(); }
    public static class AdminAnalyticsResponseBuilder {
        private long totalStudents;
        private long totalFaculty;
        private long totalSessions;
        private String bestDepartment;
        private String needsImprovementDepartment;
        private List<DepartmentAnalytics> departmentComparison;

        public AdminAnalyticsResponseBuilder totalStudents(long totalStudents) { this.totalStudents = totalStudents; return this; }
        public AdminAnalyticsResponseBuilder totalFaculty(long totalFaculty) { this.totalFaculty = totalFaculty; return this; }
        public AdminAnalyticsResponseBuilder totalSessions(long totalSessions) { this.totalSessions = totalSessions; return this; }
        public AdminAnalyticsResponseBuilder bestDepartment(String bestDepartment) { this.bestDepartment = bestDepartment; return this; }
        public AdminAnalyticsResponseBuilder needsImprovementDepartment(String needsImprovementDepartment) { this.needsImprovementDepartment = needsImprovementDepartment; return this; }
        public AdminAnalyticsResponseBuilder departmentComparison(List<DepartmentAnalytics> departmentComparison) { this.departmentComparison = departmentComparison; return this; }

        public AdminAnalyticsResponse build() {
            AdminAnalyticsResponse r = new AdminAnalyticsResponse();
            r.setTotalStudents(totalStudents); r.setTotalFaculty(totalFaculty);
            r.setTotalSessions(totalSessions); r.setBestDepartment(bestDepartment);
            r.setNeedsImprovementDepartment(needsImprovementDepartment);
            r.setDepartmentComparison(departmentComparison);
            return r;
        }
    }
}
