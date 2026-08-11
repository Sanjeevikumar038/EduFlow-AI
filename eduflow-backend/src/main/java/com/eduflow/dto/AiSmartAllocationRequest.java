package com.eduflow.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiSmartAllocationRequest {
    @Builder.Default
    private Integer minWeeklyWorkload = 15;

    @Builder.Default
    private Integer preferredMinWorkload = 16;

    @Builder.Default
    private Integer preferredMaxWorkload = 18;

    @Builder.Default
    private Integer maxWeeklyWorkload = 20;

    private String targetDepartment; // optional, "All" or specific

    @Builder.Default
    private String academicYear = "2026-2027";

    @Builder.Default
    private String semesterType = "Odd"; // "Odd" or "Even"

    private String versionName; // e.g. "v1", "v2"

    @Builder.Default
    private Integer sectionsPerSubject = 3; // Sections A, B, and C (M.Tech CSE = 1 Section A)

    private List<String> sections;

    @Builder.Default
    private String allocationMode = "BALANCED_MODE"; // "BALANCED_MODE" or "EXPERTISE_MODE"

    public Integer getMinWeeklyWorkload() { return minWeeklyWorkload; }
    public void setMinWeeklyWorkload(Integer minWeeklyWorkload) { this.minWeeklyWorkload = minWeeklyWorkload; }
    public Integer getPreferredMinWorkload() { return preferredMinWorkload; }
    public void setPreferredMinWorkload(Integer preferredMinWorkload) { this.preferredMinWorkload = preferredMinWorkload; }
    public Integer getPreferredMaxWorkload() { return preferredMaxWorkload; }
    public void setPreferredMaxWorkload(Integer preferredMaxWorkload) { this.preferredMaxWorkload = preferredMaxWorkload; }
    public Integer getMaxWeeklyWorkload() { return maxWeeklyWorkload; }
    public void setMaxWeeklyWorkload(Integer maxWeeklyWorkload) { this.maxWeeklyWorkload = maxWeeklyWorkload; }
    public String getTargetDepartment() { return targetDepartment; }
    public void setTargetDepartment(String targetDepartment) { this.targetDepartment = targetDepartment; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public String getSemesterType() { return semesterType; }
    public void setSemesterType(String semesterType) { this.semesterType = semesterType; }
    public String getVersionName() { return versionName; }
    public void setVersionName(String versionName) { this.versionName = versionName; }
    public Integer getSectionsPerSubject() { return sectionsPerSubject; }
    public void setSectionsPerSubject(Integer sectionsPerSubject) { this.sectionsPerSubject = sectionsPerSubject; }
    public List<String> getSections() { return sections; }
    public void setSections(List<String> sections) { this.sections = sections; }
    public String getAllocationMode() { return allocationMode; }
    public void setAllocationMode(String allocationMode) { this.allocationMode = allocationMode; }

    public static AiSmartAllocationRequestBuilder builder() { return new AiSmartAllocationRequestBuilder(); }
    public static class AiSmartAllocationRequestBuilder {
        private Integer minWeeklyWorkload = 15;
        private Integer preferredMinWorkload = 16;
        private Integer preferredMaxWorkload = 18;
        private Integer maxWeeklyWorkload = 20;
        private String targetDepartment;
        private String academicYear = "2026-2027";
        private String semesterType = "Odd";
        private String versionName;
        private Integer sectionsPerSubject = 3;
        private List<String> sections;
        private String allocationMode = "BALANCED_MODE";

        public AiSmartAllocationRequestBuilder minWeeklyWorkload(Integer minWeeklyWorkload) { this.minWeeklyWorkload = minWeeklyWorkload; return this; }
        public AiSmartAllocationRequestBuilder preferredMinWorkload(Integer preferredMinWorkload) { this.preferredMinWorkload = preferredMinWorkload; return this; }
        public AiSmartAllocationRequestBuilder preferredMaxWorkload(Integer preferredMaxWorkload) { this.preferredMaxWorkload = preferredMaxWorkload; return this; }
        public AiSmartAllocationRequestBuilder maxWeeklyWorkload(Integer maxWeeklyWorkload) { this.maxWeeklyWorkload = maxWeeklyWorkload; return this; }
        public AiSmartAllocationRequestBuilder targetDepartment(String targetDepartment) { this.targetDepartment = targetDepartment; return this; }
        public AiSmartAllocationRequestBuilder academicYear(String academicYear) { this.academicYear = academicYear; return this; }
        public AiSmartAllocationRequestBuilder semesterType(String semesterType) { this.semesterType = semesterType; return this; }
        public AiSmartAllocationRequestBuilder versionName(String versionName) { this.versionName = versionName; return this; }
        public AiSmartAllocationRequestBuilder sectionsPerSubject(Integer sectionsPerSubject) { this.sectionsPerSubject = sectionsPerSubject; return this; }
        public AiSmartAllocationRequestBuilder sections(List<String> sections) { this.sections = sections; return this; }
        public AiSmartAllocationRequestBuilder allocationMode(String allocationMode) { this.allocationMode = allocationMode; return this; }

        public AiSmartAllocationRequest build() {
            AiSmartAllocationRequest r = new AiSmartAllocationRequest();
            if (minWeeklyWorkload != null) r.setMinWeeklyWorkload(minWeeklyWorkload);
            if (preferredMinWorkload != null) r.setPreferredMinWorkload(preferredMinWorkload);
            if (preferredMaxWorkload != null) r.setPreferredMaxWorkload(preferredMaxWorkload);
            if (maxWeeklyWorkload != null) r.setMaxWeeklyWorkload(maxWeeklyWorkload);
            r.setTargetDepartment(targetDepartment);
            if (academicYear != null) r.setAcademicYear(academicYear);
            if (semesterType != null) r.setSemesterType(semesterType);
            r.setVersionName(versionName);
            if (sectionsPerSubject != null) r.setSectionsPerSubject(sectionsPerSubject);
            r.setSections(sections);
            if (allocationMode != null) r.setAllocationMode(allocationMode);
            return r;
        }
    }
}
