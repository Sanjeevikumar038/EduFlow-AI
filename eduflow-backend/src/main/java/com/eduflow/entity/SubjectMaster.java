package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subject_master")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String subjectCode;

    @Column(nullable = false)
    private String subjectName;

    private String department;

    private Integer semester;

    private String academicYear;

    private Integer credits;

    private Integer weeklyHours;

    @Enumerated(EnumType.STRING)
    private SubjectCategory subjectCategory;

    @Builder.Default
    private boolean active = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }
    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }
    public Integer getWeeklyHours() { return weeklyHours; }
    public void setWeeklyHours(Integer weeklyHours) { this.weeklyHours = weeklyHours; }
    public SubjectCategory getSubjectCategory() { return subjectCategory; }
    public void setSubjectCategory(SubjectCategory subjectCategory) { this.subjectCategory = subjectCategory; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public static SubjectMasterBuilder builder() { return new SubjectMasterBuilder(); }
    public static class SubjectMasterBuilder {
        private Long id;
        private String subjectCode;
        private String subjectName;
        private String department;
        private Integer semester;
        private String academicYear;
        private Integer credits;
        private Integer weeklyHours;
        private SubjectCategory subjectCategory;
        private boolean active = true;

        public SubjectMasterBuilder id(Long id) { this.id = id; return this; }
        public SubjectMasterBuilder subjectCode(String subjectCode) { this.subjectCode = subjectCode; return this; }
        public SubjectMasterBuilder subjectName(String subjectName) { this.subjectName = subjectName; return this; }
        public SubjectMasterBuilder department(String department) { this.department = department; return this; }
        public SubjectMasterBuilder semester(Integer semester) { this.semester = semester; return this; }
        public SubjectMasterBuilder academicYear(String academicYear) { this.academicYear = academicYear; return this; }
        public SubjectMasterBuilder credits(Integer credits) { this.credits = credits; return this; }
        public SubjectMasterBuilder weeklyHours(Integer weeklyHours) { this.weeklyHours = weeklyHours; return this; }
        public SubjectMasterBuilder subjectCategory(SubjectCategory subjectCategory) { this.subjectCategory = subjectCategory; return this; }
        public SubjectMasterBuilder active(boolean active) { this.active = active; return this; }

        public SubjectMaster build() {
            SubjectMaster s = new SubjectMaster();
            s.setId(id); s.setSubjectCode(subjectCode); s.setSubjectName(subjectName);
            s.setDepartment(department); s.setSemester(semester); s.setAcademicYear(academicYear);
            s.setCredits(credits); s.setWeeklyHours(weeklyHours); s.setSubjectCategory(subjectCategory);
            s.setActive(active);
            return s;
        }
    }
}
