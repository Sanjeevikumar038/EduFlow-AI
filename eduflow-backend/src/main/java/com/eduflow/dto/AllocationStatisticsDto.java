package com.eduflow.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocationStatisticsDto {
    private int tasksAllocated;
    private int totalTasks;
    private int facultyUtilized;
    private int totalFaculty;
    private double averageLoad;
    private double medianLoad;
    private double standardDeviation;
    private double expertiseMatchPercentage;
    private double departmentMatchPercentage;

    public int getTasksAllocated() { return tasksAllocated; }
    public void setTasksAllocated(int tasksAllocated) { this.tasksAllocated = tasksAllocated; }
    public int getTotalTasks() { return totalTasks; }
    public void setTotalTasks(int totalTasks) { this.totalTasks = totalTasks; }
    public int getFacultyUtilized() { return facultyUtilized; }
    public void setFacultyUtilized(int facultyUtilized) { this.facultyUtilized = facultyUtilized; }
    public int getTotalFaculty() { return totalFaculty; }
    public void setTotalFaculty(int totalFaculty) { this.totalFaculty = totalFaculty; }
    public double getAverageLoad() { return averageLoad; }
    public void setAverageLoad(double averageLoad) { this.averageLoad = averageLoad; }
    public double getMedianLoad() { return medianLoad; }
    public void setMedianLoad(double medianLoad) { this.medianLoad = medianLoad; }
    public double getStandardDeviation() { return standardDeviation; }
    public void setStandardDeviation(double standardDeviation) { this.standardDeviation = standardDeviation; }
    public double getExpertiseMatchPercentage() { return expertiseMatchPercentage; }
    public void setExpertiseMatchPercentage(double expertiseMatchPercentage) { this.expertiseMatchPercentage = expertiseMatchPercentage; }
    public double getDepartmentMatchPercentage() { return departmentMatchPercentage; }
    public void setDepartmentMatchPercentage(double departmentMatchPercentage) { this.departmentMatchPercentage = departmentMatchPercentage; }

    public static AllocationStatisticsDtoBuilder builder() { return new AllocationStatisticsDtoBuilder(); }
    public static class AllocationStatisticsDtoBuilder {
        private int tasksAllocated;
        private int totalTasks;
        private int facultyUtilized;
        private int totalFaculty;
        private double averageLoad;
        private double medianLoad;
        private double standardDeviation;
        private double expertiseMatchPercentage;
        private double departmentMatchPercentage;

        public AllocationStatisticsDtoBuilder tasksAllocated(int tasksAllocated) { this.tasksAllocated = tasksAllocated; return this; }
        public AllocationStatisticsDtoBuilder totalTasks(int totalTasks) { this.totalTasks = totalTasks; return this; }
        public AllocationStatisticsDtoBuilder facultyUtilized(int facultyUtilized) { this.facultyUtilized = facultyUtilized; return this; }
        public AllocationStatisticsDtoBuilder totalFaculty(int totalFaculty) { this.totalFaculty = totalFaculty; return this; }
        public AllocationStatisticsDtoBuilder averageLoad(double averageLoad) { this.averageLoad = averageLoad; return this; }
        public AllocationStatisticsDtoBuilder medianLoad(double medianLoad) { this.medianLoad = medianLoad; return this; }
        public AllocationStatisticsDtoBuilder standardDeviation(double standardDeviation) { this.standardDeviation = standardDeviation; return this; }
        public AllocationStatisticsDtoBuilder expertiseMatchPercentage(double expertiseMatchPercentage) { this.expertiseMatchPercentage = expertiseMatchPercentage; return this; }
        public AllocationStatisticsDtoBuilder departmentMatchPercentage(double departmentMatchPercentage) { this.departmentMatchPercentage = departmentMatchPercentage; return this; }

        public AllocationStatisticsDto build() {
            AllocationStatisticsDto dto = new AllocationStatisticsDto();
            dto.setTasksAllocated(tasksAllocated);
            dto.setTotalTasks(totalTasks);
            dto.setFacultyUtilized(facultyUtilized);
            dto.setTotalFaculty(totalFaculty);
            dto.setAverageLoad(averageLoad);
            dto.setMedianLoad(medianLoad);
            dto.setStandardDeviation(standardDeviation);
            dto.setExpertiseMatchPercentage(expertiseMatchPercentage);
            dto.setDepartmentMatchPercentage(departmentMatchPercentage);
            return dto;
        }
    }
}
