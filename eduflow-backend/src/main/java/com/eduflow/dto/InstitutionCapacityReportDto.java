package com.eduflow.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstitutionCapacityReportDto {
    private int totalTeachingHours;
    private int facultyCount;
    private double averageAchievableLoad;
    private int configuredMinimum;
    private boolean achievable;
    private int requiredTeachingHours;
    private int shortfall;
    private String feasibilityMessage;

    public int getTotalTeachingHours() { return totalTeachingHours; }
    public void setTotalTeachingHours(int totalTeachingHours) { this.totalTeachingHours = totalTeachingHours; }
    public int getFacultyCount() { return facultyCount; }
    public void setFacultyCount(int facultyCount) { this.facultyCount = facultyCount; }
    public double getAverageAchievableLoad() { return averageAchievableLoad; }
    public void setAverageAchievableLoad(double averageAchievableLoad) { this.averageAchievableLoad = averageAchievableLoad; }
    public int getConfiguredMinimum() { return configuredMinimum; }
    public void setConfiguredMinimum(int configuredMinimum) { this.configuredMinimum = configuredMinimum; }
    public boolean isAchievable() { return achievable; }
    public void setAchievable(boolean achievable) { this.achievable = achievable; }
    public int getRequiredTeachingHours() { return requiredTeachingHours; }
    public void setRequiredTeachingHours(int requiredTeachingHours) { this.requiredTeachingHours = requiredTeachingHours; }
    public int getShortfall() { return shortfall; }
    public void setShortfall(int shortfall) { this.shortfall = shortfall; }
    public String getFeasibilityMessage() { return feasibilityMessage; }
    public void setFeasibilityMessage(String feasibilityMessage) { this.feasibilityMessage = feasibilityMessage; }

    public static InstitutionCapacityReportDtoBuilder builder() { return new InstitutionCapacityReportDtoBuilder(); }
    public static class InstitutionCapacityReportDtoBuilder {
        private int totalTeachingHours;
        private int facultyCount;
        private double averageAchievableLoad;
        private int configuredMinimum;
        private boolean achievable;
        private int requiredTeachingHours;
        private int shortfall;
        private String feasibilityMessage;

        public InstitutionCapacityReportDtoBuilder totalTeachingHours(int totalTeachingHours) { this.totalTeachingHours = totalTeachingHours; return this; }
        public InstitutionCapacityReportDtoBuilder facultyCount(int facultyCount) { this.facultyCount = facultyCount; return this; }
        public InstitutionCapacityReportDtoBuilder averageAchievableLoad(double averageAchievableLoad) { this.averageAchievableLoad = averageAchievableLoad; return this; }
        public InstitutionCapacityReportDtoBuilder configuredMinimum(int configuredMinimum) { this.configuredMinimum = configuredMinimum; return this; }
        public InstitutionCapacityReportDtoBuilder achievable(boolean achievable) { this.achievable = achievable; return this; }
        public InstitutionCapacityReportDtoBuilder requiredTeachingHours(int requiredTeachingHours) { this.requiredTeachingHours = requiredTeachingHours; return this; }
        public InstitutionCapacityReportDtoBuilder shortfall(int shortfall) { this.shortfall = shortfall; return this; }
        public InstitutionCapacityReportDtoBuilder feasibilityMessage(String feasibilityMessage) { this.feasibilityMessage = feasibilityMessage; return this; }

        public InstitutionCapacityReportDto build() {
            InstitutionCapacityReportDto dto = new InstitutionCapacityReportDto();
            dto.setTotalTeachingHours(totalTeachingHours); dto.setFacultyCount(facultyCount);
            dto.setAverageAchievableLoad(averageAchievableLoad); dto.setConfiguredMinimum(configuredMinimum);
            dto.setAchievable(achievable); dto.setRequiredTeachingHours(requiredTeachingHours);
            dto.setShortfall(shortfall); dto.setFeasibilityMessage(feasibilityMessage);
            return dto;
        }
    }
}
