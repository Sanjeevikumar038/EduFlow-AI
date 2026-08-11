package com.eduflow.dto;

public class DepartmentCapacityReportDto {
    private String department;
    private int facultyCount;
    private int hodCount;
    private int sectionsGenerated;
    private int totalTeachingHours;
    private double averageLoad;
    private String targetRange;
    private String status; // "BALANCED", "UNDERLOADED", "OVERLOADED"
    private String recommendation;

    public DepartmentCapacityReportDto() {}

    public DepartmentCapacityReportDto(String department, int facultyCount, int hodCount, int sectionsGenerated, int totalTeachingHours, double averageLoad, String targetRange, String status, String recommendation) {
        this.department = department;
        this.facultyCount = facultyCount;
        this.hodCount = hodCount;
        this.sectionsGenerated = sectionsGenerated;
        this.totalTeachingHours = totalTeachingHours;
        this.averageLoad = averageLoad;
        this.targetRange = targetRange;
        this.status = status;
        this.recommendation = recommendation;
    }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public int getFacultyCount() { return facultyCount; }
    public void setFacultyCount(int facultyCount) { this.facultyCount = facultyCount; }
    public int getHodCount() { return hodCount; }
    public void setHodCount(int hodCount) { this.hodCount = hodCount; }
    public int getSectionsGenerated() { return sectionsGenerated; }
    public void setSectionsGenerated(int sectionsGenerated) { this.sectionsGenerated = sectionsGenerated; }
    public int getTotalTeachingHours() { return totalTeachingHours; }
    public void setTotalTeachingHours(int totalTeachingHours) { this.totalTeachingHours = totalTeachingHours; }
    public double getAverageLoad() { return averageLoad; }
    public void setAverageLoad(double averageLoad) { this.averageLoad = averageLoad; }
    public String getTargetRange() { return targetRange; }
    public void setTargetRange(String targetRange) { this.targetRange = targetRange; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }

    public static DepartmentCapacityReportDtoBuilder builder() { return new DepartmentCapacityReportDtoBuilder(); }
    public static class DepartmentCapacityReportDtoBuilder {
        private String department;
        private int facultyCount;
        private int hodCount;
        private int sectionsGenerated;
        private int totalTeachingHours;
        private double averageLoad;
        private String targetRange;
        private String status;
        private String recommendation;

        public DepartmentCapacityReportDtoBuilder department(String department) { this.department = department; return this; }
        public DepartmentCapacityReportDtoBuilder facultyCount(int facultyCount) { this.facultyCount = facultyCount; return this; }
        public DepartmentCapacityReportDtoBuilder hodCount(int hodCount) { this.hodCount = hodCount; return this; }
        public DepartmentCapacityReportDtoBuilder sectionsGenerated(int sectionsGenerated) { this.sectionsGenerated = sectionsGenerated; return this; }
        public DepartmentCapacityReportDtoBuilder totalTeachingHours(int totalTeachingHours) { this.totalTeachingHours = totalTeachingHours; return this; }
        public DepartmentCapacityReportDtoBuilder averageLoad(double averageLoad) { this.averageLoad = averageLoad; return this; }
        public DepartmentCapacityReportDtoBuilder targetRange(String targetRange) { this.targetRange = targetRange; return this; }
        public DepartmentCapacityReportDtoBuilder status(String status) { this.status = status; return this; }
        public DepartmentCapacityReportDtoBuilder recommendation(String recommendation) { this.recommendation = recommendation; return this; }

        public DepartmentCapacityReportDto build() {
            DepartmentCapacityReportDto dto = new DepartmentCapacityReportDto();
            dto.setDepartment(department); dto.setFacultyCount(facultyCount); dto.setHodCount(hodCount);
            dto.setSectionsGenerated(sectionsGenerated); dto.setTotalTeachingHours(totalTeachingHours);
            dto.setAverageLoad(averageLoad); dto.setTargetRange(targetRange); dto.setStatus(status);
            dto.setRecommendation(recommendation);
            return dto;
        }
    }
}
