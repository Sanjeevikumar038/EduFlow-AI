package com.eduflow.dto;

public class FacultyWorkloadDto {
    private Long facultyId;
    private String facultyName;
    private String department;
    private Long allocatedPeriods; // Scheduled / Allocated Odd Semester Hours
    private Integer availablePeriods; // Max limit (19/12 hrs per week)
    private Integer approvedAnnualHours;
    private Integer approvedOddCycleHours;
    private Integer approvedEvenCycleHours;
    private String activeCycle; // "ODD"
    private Double utilizationPercentage;
    private String workloadStatus; // "UNDERLOADED", "BALANCED", "OVERLOADED"

    // Active Semester Engine Fields
    private Integer oddSemesterTarget;
    private Double realisticTarget;
    private Boolean isTargetAchievable;
    private Integer capacityShortfall;
    private String feasibilityWarning;
    private Integer minRequired;
    private String preferredRange;
    private Integer maxAllowed;
    private Integer difference;
    private String recommendation;
    private Integer subjectsAssignedCount;
    private Integer sectionsTeaching;
    private Double expertiseMatchPercentage;
    private Boolean isHod;

    public FacultyWorkloadDto() {}

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }
    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Long getAllocatedPeriods() { return allocatedPeriods; }
    public void setAllocatedPeriods(Long allocatedPeriods) { this.allocatedPeriods = allocatedPeriods; }
    public Integer getAvailablePeriods() { return availablePeriods; }
    public void setAvailablePeriods(Integer availablePeriods) { this.availablePeriods = availablePeriods; }
    public Integer getApprovedAnnualHours() { return approvedAnnualHours; }
    public void setApprovedAnnualHours(Integer approvedAnnualHours) { this.approvedAnnualHours = approvedAnnualHours; }
    public Integer getApprovedOddCycleHours() { return approvedOddCycleHours; }
    public void setApprovedOddCycleHours(Integer approvedOddCycleHours) { this.approvedOddCycleHours = approvedOddCycleHours; }
    public Integer getApprovedEvenCycleHours() { return approvedEvenCycleHours; }
    public void setApprovedEvenCycleHours(Integer approvedEvenCycleHours) { this.approvedEvenCycleHours = approvedEvenCycleHours; }
    public String getActiveCycle() { return activeCycle; }
    public void setActiveCycle(String activeCycle) { this.activeCycle = activeCycle; }
    public Double getUtilizationPercentage() { return utilizationPercentage; }
    public void setUtilizationPercentage(Double utilizationPercentage) { this.utilizationPercentage = utilizationPercentage; }
    public String getWorkloadStatus() { return workloadStatus; }
    public void setWorkloadStatus(String workloadStatus) { this.workloadStatus = workloadStatus; }
    public Integer getOddSemesterTarget() { return oddSemesterTarget; }
    public void setOddSemesterTarget(Integer oddSemesterTarget) { this.oddSemesterTarget = oddSemesterTarget; }
    public Double getRealisticTarget() { return realisticTarget; }
    public void setRealisticTarget(Double realisticTarget) { this.realisticTarget = realisticTarget; }
    public Boolean getIsTargetAchievable() { return isTargetAchievable; }
    public void setIsTargetAchievable(Boolean isTargetAchievable) { this.isTargetAchievable = isTargetAchievable; }
    public Integer getCapacityShortfall() { return capacityShortfall; }
    public void setCapacityShortfall(Integer capacityShortfall) { this.capacityShortfall = capacityShortfall; }
    public String getFeasibilityWarning() { return feasibilityWarning; }
    public void setFeasibilityWarning(String feasibilityWarning) { this.feasibilityWarning = feasibilityWarning; }
    public Integer getMinRequired() { return minRequired; }
    public void setMinRequired(Integer minRequired) { this.minRequired = minRequired; }
    public String getPreferredRange() { return preferredRange; }
    public void setPreferredRange(String preferredRange) { this.preferredRange = preferredRange; }
    public Integer getMaxAllowed() { return maxAllowed; }
    public void setMaxAllowed(Integer maxAllowed) { this.maxAllowed = maxAllowed; }
    public Integer getDifference() { return difference; }
    public void setDifference(Integer difference) { this.difference = difference; }
    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
    public Integer getSubjectsAssignedCount() { return subjectsAssignedCount; }
    public void setSubjectsAssignedCount(Integer subjectsAssignedCount) { this.subjectsAssignedCount = subjectsAssignedCount; }
    public Integer getSectionsTeaching() { return sectionsTeaching; }
    public void setSectionsTeaching(Integer sectionsTeaching) { this.sectionsTeaching = sectionsTeaching; }
    public Double getExpertiseMatchPercentage() { return expertiseMatchPercentage; }
    public void setExpertiseMatchPercentage(Double expertiseMatchPercentage) { this.expertiseMatchPercentage = expertiseMatchPercentage; }
    public Boolean getIsHod() { return isHod; }
    public void setIsHod(Boolean isHod) { this.isHod = isHod; }

    public static FacultyWorkloadDtoBuilder builder() { return new FacultyWorkloadDtoBuilder(); }
    public static class FacultyWorkloadDtoBuilder {
        private Long facultyId;
        private String facultyName;
        private String department;
        private Long allocatedPeriods;
        private Integer availablePeriods;
        private Integer approvedAnnualHours;
        private Integer approvedOddCycleHours;
        private Integer approvedEvenCycleHours;
        private String activeCycle;
        private Double utilizationPercentage;
        private String workloadStatus;
        private Integer oddSemesterTarget;
        private Double realisticTarget;
        private Boolean isTargetAchievable;
        private Integer capacityShortfall;
        private String feasibilityWarning;
        private Integer minRequired;
        private String preferredRange;
        private Integer maxAllowed;
        private Integer difference;
        private String recommendation;
        private Integer subjectsAssignedCount;
        private Integer sectionsTeaching;
        private Double expertiseMatchPercentage;
        private Boolean isHod;

        public FacultyWorkloadDtoBuilder facultyId(Long facultyId) { this.facultyId = facultyId; return this; }
        public FacultyWorkloadDtoBuilder facultyName(String facultyName) { this.facultyName = facultyName; return this; }
        public FacultyWorkloadDtoBuilder department(String department) { this.department = department; return this; }
        public FacultyWorkloadDtoBuilder allocatedPeriods(Long allocatedPeriods) { this.allocatedPeriods = allocatedPeriods; return this; }
        public FacultyWorkloadDtoBuilder availablePeriods(Integer availablePeriods) { this.availablePeriods = availablePeriods; return this; }
        public FacultyWorkloadDtoBuilder approvedAnnualHours(Integer approvedAnnualHours) { this.approvedAnnualHours = approvedAnnualHours; return this; }
        public FacultyWorkloadDtoBuilder approvedOddCycleHours(Integer approvedOddCycleHours) { this.approvedOddCycleHours = approvedOddCycleHours; return this; }
        public FacultyWorkloadDtoBuilder approvedEvenCycleHours(Integer approvedEvenCycleHours) { this.approvedEvenCycleHours = approvedEvenCycleHours; return this; }
        public FacultyWorkloadDtoBuilder activeCycle(String activeCycle) { this.activeCycle = activeCycle; return this; }
        public FacultyWorkloadDtoBuilder utilizationPercentage(Double utilizationPercentage) { this.utilizationPercentage = utilizationPercentage; return this; }
        public FacultyWorkloadDtoBuilder workloadStatus(String workloadStatus) { this.workloadStatus = workloadStatus; return this; }
        public FacultyWorkloadDtoBuilder oddSemesterTarget(Integer oddSemesterTarget) { this.oddSemesterTarget = oddSemesterTarget; return this; }
        public FacultyWorkloadDtoBuilder realisticTarget(Double realisticTarget) { this.realisticTarget = realisticTarget; return this; }
        public FacultyWorkloadDtoBuilder isTargetAchievable(Boolean isTargetAchievable) { this.isTargetAchievable = isTargetAchievable; return this; }
        public FacultyWorkloadDtoBuilder capacityShortfall(Integer capacityShortfall) { this.capacityShortfall = capacityShortfall; return this; }
        public FacultyWorkloadDtoBuilder feasibilityWarning(String feasibilityWarning) { this.feasibilityWarning = feasibilityWarning; return this; }
        public FacultyWorkloadDtoBuilder minRequired(Integer minRequired) { this.minRequired = minRequired; return this; }
        public FacultyWorkloadDtoBuilder preferredRange(String preferredRange) { this.preferredRange = preferredRange; return this; }
        public FacultyWorkloadDtoBuilder maxAllowed(Integer maxAllowed) { this.maxAllowed = maxAllowed; return this; }
        public FacultyWorkloadDtoBuilder difference(Integer difference) { this.difference = difference; return this; }
        public FacultyWorkloadDtoBuilder recommendation(String recommendation) { this.recommendation = recommendation; return this; }
        public FacultyWorkloadDtoBuilder subjectsAssignedCount(Integer subjectsAssignedCount) { this.subjectsAssignedCount = subjectsAssignedCount; return this; }
        public FacultyWorkloadDtoBuilder sectionsTeaching(Integer sectionsTeaching) { this.sectionsTeaching = sectionsTeaching; return this; }
        public FacultyWorkloadDtoBuilder expertiseMatchPercentage(Double expertiseMatchPercentage) { this.expertiseMatchPercentage = expertiseMatchPercentage; return this; }
        public FacultyWorkloadDtoBuilder isHod(Boolean isHod) { this.isHod = isHod; return this; }

        public FacultyWorkloadDto build() {
            FacultyWorkloadDto dto = new FacultyWorkloadDto();
            dto.setFacultyId(facultyId); dto.setFacultyName(facultyName); dto.setDepartment(department);
            dto.setAllocatedPeriods(allocatedPeriods); dto.setAvailablePeriods(availablePeriods);
            dto.setApprovedAnnualHours(approvedAnnualHours); dto.setApprovedOddCycleHours(approvedOddCycleHours);
            dto.setApprovedEvenCycleHours(approvedEvenCycleHours); dto.setActiveCycle(activeCycle);
            dto.setUtilizationPercentage(utilizationPercentage); dto.setWorkloadStatus(workloadStatus);
            dto.setOddSemesterTarget(oddSemesterTarget); dto.setRealisticTarget(realisticTarget);
            dto.setIsTargetAchievable(isTargetAchievable); dto.setCapacityShortfall(capacityShortfall);
            dto.setFeasibilityWarning(feasibilityWarning); dto.setMinRequired(minRequired);
            dto.setPreferredRange(preferredRange); dto.setMaxAllowed(maxAllowed);
            dto.setDifference(difference); dto.setRecommendation(recommendation);
            dto.setSubjectsAssignedCount(subjectsAssignedCount);
            dto.setSectionsTeaching(sectionsTeaching);
            dto.setExpertiseMatchPercentage(expertiseMatchPercentage);
            dto.setIsHod(isHod);
            return dto;
        }
    }
}
