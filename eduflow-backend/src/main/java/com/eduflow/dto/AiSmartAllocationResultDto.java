package com.eduflow.dto;

import com.eduflow.entity.FacultyWorkloadAllocation;
import java.util.List;

public class AiSmartAllocationResultDto {
    private String versionName;
    private String academicYear;
    private String semesterType;
    private String status; // "DRAFT", "APPROVED", "ARCHIVED"

    private int totalSubjects;
    private int totalSubjectsAllocated;
    private int pendingSubjects;
    private double successPercentage;

    private int totalFacultyUtilized;
    private int unusedFacultyCount;
    private int totalTeachingHours;
    private double averageWorkloadHours;
    private int highestWorkloadHours;
    private int lowestWorkloadHours;
    private int maxConfiguredWorkload;

    private double balanceScore;
    private int constraintViolationsCount;

    private String statusMessage;
    private List<FacultyWorkloadAllocation> allocations;
    private List<AllocationFailureRecordDto> failureReport;
    private List<FacultyWorkloadDto> facultySummary;
    private List<DepartmentCapacityReportDto> departmentCapacityReport;
    private List<RoundAnalyticsDto> roundAnalytics;
    private AllocationStatisticsDto allocationStatistics;

    private int belowMinimumCount;
    private int withinPreferredCount;
    private int aboveMaximumCount;

    public AiSmartAllocationResultDto() {}

    public String getVersionName() { return versionName; }
    public void setVersionName(String versionName) { this.versionName = versionName; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public String getSemesterType() { return semesterType; }
    public void setSemesterType(String semesterType) { this.semesterType = semesterType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getTotalSubjects() { return totalSubjects; }
    public void setTotalSubjects(int totalSubjects) { this.totalSubjects = totalSubjects; }
    public int getTotalSubjectsAllocated() { return totalSubjectsAllocated; }
    public void setTotalSubjectsAllocated(int totalSubjectsAllocated) { this.totalSubjectsAllocated = totalSubjectsAllocated; }
    public int getPendingSubjects() { return pendingSubjects; }
    public void setPendingSubjects(int pendingSubjects) { this.pendingSubjects = pendingSubjects; }
    public double getSuccessPercentage() { return successPercentage; }
    public void setSuccessPercentage(double successPercentage) { this.successPercentage = successPercentage; }
    public int getTotalFacultyUtilized() { return totalFacultyUtilized; }
    public void setTotalFacultyUtilized(int totalFacultyUtilized) { this.totalFacultyUtilized = totalFacultyUtilized; }
    public int getUnusedFacultyCount() { return unusedFacultyCount; }
    public void setUnusedFacultyCount(int unusedFacultyCount) { this.unusedFacultyCount = unusedFacultyCount; }
    public int getTotalTeachingHours() { return totalTeachingHours; }
    public void setTotalTeachingHours(int totalTeachingHours) { this.totalTeachingHours = totalTeachingHours; }
    public double getAverageWorkloadHours() { return averageWorkloadHours; }
    public void setAverageWorkloadHours(double averageWorkloadHours) { this.averageWorkloadHours = averageWorkloadHours; }
    public int getHighestWorkloadHours() { return highestWorkloadHours; }
    public void setHighestWorkloadHours(int highestWorkloadHours) { this.highestWorkloadHours = highestWorkloadHours; }
    public int getLowestWorkloadHours() { return lowestWorkloadHours; }
    public void setLowestWorkloadHours(int lowestWorkloadHours) { this.lowestWorkloadHours = lowestWorkloadHours; }
    public int getMaxConfiguredWorkload() { return maxConfiguredWorkload; }
    public void setMaxConfiguredWorkload(int maxConfiguredWorkload) { this.maxConfiguredWorkload = maxConfiguredWorkload; }
    public double getBalanceScore() { return balanceScore; }
    public void setBalanceScore(double balanceScore) { this.balanceScore = balanceScore; }
    public int getConstraintViolationsCount() { return constraintViolationsCount; }
    public void setConstraintViolationsCount(int constraintViolationsCount) { this.constraintViolationsCount = constraintViolationsCount; }
    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }
    public List<FacultyWorkloadAllocation> getAllocations() { return allocations; }
    public void setAllocations(List<FacultyWorkloadAllocation> allocations) { this.allocations = allocations; }
    public List<AllocationFailureRecordDto> getFailureReport() { return failureReport; }
    public void setFailureReport(List<AllocationFailureRecordDto> failureReport) { this.failureReport = failureReport; }
    public List<FacultyWorkloadDto> getFacultySummary() { return facultySummary; }
    public void setFacultySummary(List<FacultyWorkloadDto> facultySummary) { this.facultySummary = facultySummary; }
    public List<DepartmentCapacityReportDto> getDepartmentCapacityReport() { return departmentCapacityReport; }
    public void setDepartmentCapacityReport(List<DepartmentCapacityReportDto> departmentCapacityReport) { this.departmentCapacityReport = departmentCapacityReport; }
    public List<RoundAnalyticsDto> getRoundAnalytics() { return roundAnalytics; }
    public void setRoundAnalytics(List<RoundAnalyticsDto> roundAnalytics) { this.roundAnalytics = roundAnalytics; }
    public AllocationStatisticsDto getAllocationStatistics() { return allocationStatistics; }
    public void setAllocationStatistics(AllocationStatisticsDto allocationStatistics) { this.allocationStatistics = allocationStatistics; }
    public int getBelowMinimumCount() { return belowMinimumCount; }
    public void setBelowMinimumCount(int belowMinimumCount) { this.belowMinimumCount = belowMinimumCount; }
    public int getWithinPreferredCount() { return withinPreferredCount; }
    public void setWithinPreferredCount(int withinPreferredCount) { this.withinPreferredCount = withinPreferredCount; }
    public int getAboveMaximumCount() { return aboveMaximumCount; }
    public void setAboveMaximumCount(int aboveMaximumCount) { this.aboveMaximumCount = aboveMaximumCount; }

    public static AiSmartAllocationResultDtoBuilder builder() { return new AiSmartAllocationResultDtoBuilder(); }
    public static class AiSmartAllocationResultDtoBuilder {
        private String versionName;
        private String academicYear;
        private String semesterType;
        private String status;
        private int totalSubjects;
        private int totalSubjectsAllocated;
        private int pendingSubjects;
        private double successPercentage;
        private int totalFacultyUtilized;
        private int unusedFacultyCount;
        private int totalTeachingHours;
        private double averageWorkloadHours;
        private int highestWorkloadHours;
        private int lowestWorkloadHours;
        private int maxConfiguredWorkload;
        private double balanceScore;
        private int constraintViolationsCount;
        private String statusMessage;
        private List<FacultyWorkloadAllocation> allocations;
        private List<AllocationFailureRecordDto> failureReport;
        private List<FacultyWorkloadDto> facultySummary;
        private List<DepartmentCapacityReportDto> departmentCapacityReport;
        private List<RoundAnalyticsDto> roundAnalytics;
        private AllocationStatisticsDto allocationStatistics;
        private int belowMinimumCount;
        private int withinPreferredCount;
        private int aboveMaximumCount;

        public AiSmartAllocationResultDtoBuilder versionName(String versionName) { this.versionName = versionName; return this; }
        public AiSmartAllocationResultDtoBuilder academicYear(String academicYear) { this.academicYear = academicYear; return this; }
        public AiSmartAllocationResultDtoBuilder semesterType(String semesterType) { this.semesterType = semesterType; return this; }
        public AiSmartAllocationResultDtoBuilder status(String status) { this.status = status; return this; }
        public AiSmartAllocationResultDtoBuilder totalSubjects(int totalSubjects) { this.totalSubjects = totalSubjects; return this; }
        public AiSmartAllocationResultDtoBuilder totalSubjectsAllocated(int totalSubjectsAllocated) { this.totalSubjectsAllocated = totalSubjectsAllocated; return this; }
        public AiSmartAllocationResultDtoBuilder pendingSubjects(int pendingSubjects) { this.pendingSubjects = pendingSubjects; return this; }
        public AiSmartAllocationResultDtoBuilder successPercentage(double successPercentage) { this.successPercentage = successPercentage; return this; }
        public AiSmartAllocationResultDtoBuilder totalFacultyUtilized(int totalFacultyUtilized) { this.totalFacultyUtilized = totalFacultyUtilized; return this; }
        public AiSmartAllocationResultDtoBuilder unusedFacultyCount(int unusedFacultyCount) { this.unusedFacultyCount = unusedFacultyCount; return this; }
        public AiSmartAllocationResultDtoBuilder totalTeachingHours(int totalTeachingHours) { this.totalTeachingHours = totalTeachingHours; return this; }
        public AiSmartAllocationResultDtoBuilder averageWorkloadHours(double averageWorkloadHours) { this.averageWorkloadHours = averageWorkloadHours; return this; }
        public AiSmartAllocationResultDtoBuilder highestWorkloadHours(int highestWorkloadHours) { this.highestWorkloadHours = highestWorkloadHours; return this; }
        public AiSmartAllocationResultDtoBuilder lowestWorkloadHours(int lowestWorkloadHours) { this.lowestWorkloadHours = lowestWorkloadHours; return this; }
        public AiSmartAllocationResultDtoBuilder maxConfiguredWorkload(int maxConfiguredWorkload) { this.maxConfiguredWorkload = maxConfiguredWorkload; return this; }
        public AiSmartAllocationResultDtoBuilder balanceScore(double balanceScore) { this.balanceScore = balanceScore; return this; }
        public AiSmartAllocationResultDtoBuilder constraintViolationsCount(int constraintViolationsCount) { this.constraintViolationsCount = constraintViolationsCount; return this; }
        public AiSmartAllocationResultDtoBuilder statusMessage(String statusMessage) { this.statusMessage = statusMessage; return this; }
        public AiSmartAllocationResultDtoBuilder allocations(List<FacultyWorkloadAllocation> allocations) { this.allocations = allocations; return this; }
        public AiSmartAllocationResultDtoBuilder failureReport(List<AllocationFailureRecordDto> failureReport) { this.failureReport = failureReport; return this; }
        public AiSmartAllocationResultDtoBuilder facultySummary(List<FacultyWorkloadDto> facultySummary) { this.facultySummary = facultySummary; return this; }
        public AiSmartAllocationResultDtoBuilder departmentCapacityReport(List<DepartmentCapacityReportDto> departmentCapacityReport) { this.departmentCapacityReport = departmentCapacityReport; return this; }
        public AiSmartAllocationResultDtoBuilder roundAnalytics(List<RoundAnalyticsDto> roundAnalytics) { this.roundAnalytics = roundAnalytics; return this; }
        public AiSmartAllocationResultDtoBuilder allocationStatistics(AllocationStatisticsDto allocationStatistics) { this.allocationStatistics = allocationStatistics; return this; }
        public AiSmartAllocationResultDtoBuilder belowMinimumCount(int belowMinimumCount) { this.belowMinimumCount = belowMinimumCount; return this; }
        public AiSmartAllocationResultDtoBuilder withinPreferredCount(int withinPreferredCount) { this.withinPreferredCount = withinPreferredCount; return this; }
        public AiSmartAllocationResultDtoBuilder aboveMaximumCount(int aboveMaximumCount) { this.aboveMaximumCount = aboveMaximumCount; return this; }

        public AiSmartAllocationResultDto build() {
            AiSmartAllocationResultDto dto = new AiSmartAllocationResultDto();
            dto.setVersionName(versionName); dto.setAcademicYear(academicYear);
            dto.setSemesterType(semesterType); dto.setStatus(status);
            dto.setTotalSubjects(totalSubjects); dto.setTotalSubjectsAllocated(totalSubjectsAllocated);
            dto.setPendingSubjects(pendingSubjects); dto.setSuccessPercentage(successPercentage);
            dto.setTotalFacultyUtilized(totalFacultyUtilized); dto.setUnusedFacultyCount(unusedFacultyCount);
            dto.setTotalTeachingHours(totalTeachingHours); dto.setAverageWorkloadHours(averageWorkloadHours);
            dto.setHighestWorkloadHours(highestWorkloadHours); dto.setLowestWorkloadHours(lowestWorkloadHours);
            dto.setMaxConfiguredWorkload(maxConfiguredWorkload); dto.setBalanceScore(balanceScore);
            dto.setConstraintViolationsCount(constraintViolationsCount); dto.setStatusMessage(statusMessage);
            dto.setAllocations(allocations); dto.setFailureReport(failureReport);
            dto.setFacultySummary(facultySummary); dto.setDepartmentCapacityReport(departmentCapacityReport);
            dto.setRoundAnalytics(roundAnalytics); dto.setAllocationStatistics(allocationStatistics);
            dto.setBelowMinimumCount(belowMinimumCount); dto.setWithinPreferredCount(withinPreferredCount);
            dto.setAboveMaximumCount(aboveMaximumCount);
            return dto;
        }
    }
}
