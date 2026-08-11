package com.eduflow.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoundAnalyticsDto {
    private int roundNumber;
    private int tasksAssignedInRound;
    private int cumulativeTasksAssigned;
    private int facultyUtilized;
    private double averageWorkloadHours;
    private String roundSummary;

    public int getRoundNumber() { return roundNumber; }
    public void setRoundNumber(int roundNumber) { this.roundNumber = roundNumber; }
    public int getTasksAssignedInRound() { return tasksAssignedInRound; }
    public void setTasksAssignedInRound(int tasksAssignedInRound) { this.tasksAssignedInRound = tasksAssignedInRound; }
    public int getCumulativeTasksAssigned() { return cumulativeTasksAssigned; }
    public void setCumulativeTasksAssigned(int cumulativeTasksAssigned) { this.cumulativeTasksAssigned = cumulativeTasksAssigned; }
    public int getFacultyUtilized() { return facultyUtilized; }
    public void setFacultyUtilized(int facultyUtilized) { this.facultyUtilized = facultyUtilized; }
    public double getAverageWorkloadHours() { return averageWorkloadHours; }
    public void setAverageWorkloadHours(double averageWorkloadHours) { this.averageWorkloadHours = averageWorkloadHours; }
    public String getRoundSummary() { return roundSummary; }
    public void setRoundSummary(String roundSummary) { this.roundSummary = roundSummary; }

    public static RoundAnalyticsDtoBuilder builder() { return new RoundAnalyticsDtoBuilder(); }
    public static class RoundAnalyticsDtoBuilder {
        private int roundNumber;
        private int tasksAssignedInRound;
        private int cumulativeTasksAssigned;
        private int facultyUtilized;
        private double averageWorkloadHours;
        private String roundSummary;

        public RoundAnalyticsDtoBuilder roundNumber(int roundNumber) { this.roundNumber = roundNumber; return this; }
        public RoundAnalyticsDtoBuilder tasksAssignedInRound(int tasksAssignedInRound) { this.tasksAssignedInRound = tasksAssignedInRound; return this; }
        public RoundAnalyticsDtoBuilder cumulativeTasksAssigned(int cumulativeTasksAssigned) { this.cumulativeTasksAssigned = cumulativeTasksAssigned; return this; }
        public RoundAnalyticsDtoBuilder facultyUtilized(int facultyUtilized) { this.facultyUtilized = facultyUtilized; return this; }
        public RoundAnalyticsDtoBuilder averageWorkloadHours(double averageWorkloadHours) { this.averageWorkloadHours = averageWorkloadHours; return this; }
        public RoundAnalyticsDtoBuilder roundSummary(String roundSummary) { this.roundSummary = roundSummary; return this; }

        public RoundAnalyticsDto build() {
            RoundAnalyticsDto dto = new RoundAnalyticsDto();
            dto.setRoundNumber(roundNumber);
            dto.setTasksAssignedInRound(tasksAssignedInRound);
            dto.setCumulativeTasksAssigned(cumulativeTasksAssigned);
            dto.setFacultyUtilized(facultyUtilized);
            dto.setAverageWorkloadHours(averageWorkloadHours);
            dto.setRoundSummary(roundSummary);
            return dto;
        }
    }
}
