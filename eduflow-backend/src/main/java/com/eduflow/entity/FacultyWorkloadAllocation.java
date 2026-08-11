package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "faculty_workload_allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyWorkloadAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id", nullable = false)
    private User faculty;

    @com.fasterxml.jackson.annotation.JsonProperty("facultyId")
    public Long getFacultyId() {
        return faculty != null ? faculty.getId() : null;
    }

    private String facultyName;
    private String facultyEmail;

    @Column(nullable = false)
    private String department;

    private String year; // e.g. "Year 1", "Year 2", "Year 3", "Year 4"

    @Column(nullable = false)
    private Integer semester;

    private String semesterType; // "Odd" or "Even"

    @Column(nullable = false)
    private String section; // e.g. "A", "B"

    @Column(name = "course_code", nullable = false)
    private String courseCode;

    @Column(nullable = false)
    private String subjectName;

    @Column(nullable = false)
    private Integer hoursPerWeek;

    private Integer credits;

    private String academicYear; // e.g. "2026-2027"

    private String versionName; // e.g. "v1", "v2", "v3"

    @Column(nullable = false)
    @Builder.Default
    private String status = "DRAFT"; // "DRAFT", "APPROVED", "ARCHIVED"

    @Column(length = 1000)
    private String aiExplanation; // e.g. "Current workload 18 hrs | Remaining capacity 12 hrs | Best balanced allocation"

    private Integer confidenceScore; // e.g. 96

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = true)
    private SubjectMaster subject;

    @Builder.Default
    private boolean active = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getFaculty() { return faculty; }
    public void setFaculty(User faculty) { this.faculty = faculty; }
    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }
    public String getFacultyEmail() { return facultyEmail; }
    public void setFacultyEmail(String facultyEmail) { this.facultyEmail = facultyEmail; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getSemesterType() { return semesterType; }
    public void setSemesterType(String semesterType) { this.semesterType = semesterType; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public Integer getHoursPerWeek() { return hoursPerWeek; }
    public void setHoursPerWeek(Integer hoursPerWeek) { this.hoursPerWeek = hoursPerWeek; }
    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public String getVersionName() { return versionName; }
    public void setVersionName(String versionName) { this.versionName = versionName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAiExplanation() { return aiExplanation; }
    public void setAiExplanation(String aiExplanation) { this.aiExplanation = aiExplanation; }
    public Integer getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Integer confidenceScore) { this.confidenceScore = confidenceScore; }
    public SubjectMaster getSubject() { return subject; }
    public void setSubject(SubjectMaster subject) { this.subject = subject; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public static FacultyWorkloadAllocationBuilder builder() { return new FacultyWorkloadAllocationBuilder(); }
    public static class FacultyWorkloadAllocationBuilder {
        private Long id;
        private User faculty;
        private String facultyName;
        private String facultyEmail;
        private String department;
        private String year;
        private Integer semester;
        private String semesterType;
        private String section;
        private String courseCode;
        private String subjectName;
        private Integer hoursPerWeek;
        private Integer credits;
        private String academicYear;
        private String versionName;
        private String status = "DRAFT";
        private String aiExplanation;
        private Integer confidenceScore = 95;
        private SubjectMaster subject;
        private boolean active = true;

        public FacultyWorkloadAllocationBuilder id(Long id) { this.id = id; return this; }
        public FacultyWorkloadAllocationBuilder faculty(User faculty) { this.faculty = faculty; return this; }
        public FacultyWorkloadAllocationBuilder facultyName(String facultyName) { this.facultyName = facultyName; return this; }
        public FacultyWorkloadAllocationBuilder facultyEmail(String facultyEmail) { this.facultyEmail = facultyEmail; return this; }
        public FacultyWorkloadAllocationBuilder department(String department) { this.department = department; return this; }
        public FacultyWorkloadAllocationBuilder year(String year) { this.year = year; return this; }
        public FacultyWorkloadAllocationBuilder semester(Integer semester) { this.semester = semester; return this; }
        public FacultyWorkloadAllocationBuilder semesterType(String semesterType) { this.semesterType = semesterType; return this; }
        public FacultyWorkloadAllocationBuilder section(String section) { this.section = section; return this; }
        public FacultyWorkloadAllocationBuilder courseCode(String courseCode) { this.courseCode = courseCode; return this; }
        public FacultyWorkloadAllocationBuilder subjectName(String subjectName) { this.subjectName = subjectName; return this; }
        public FacultyWorkloadAllocationBuilder hoursPerWeek(Integer hoursPerWeek) { this.hoursPerWeek = hoursPerWeek; return this; }
        public FacultyWorkloadAllocationBuilder credits(Integer credits) { this.credits = credits; return this; }
        public FacultyWorkloadAllocationBuilder academicYear(String academicYear) { this.academicYear = academicYear; return this; }
        public FacultyWorkloadAllocationBuilder versionName(String versionName) { this.versionName = versionName; return this; }
        public FacultyWorkloadAllocationBuilder status(String status) { this.status = status; return this; }
        public FacultyWorkloadAllocationBuilder aiExplanation(String aiExplanation) { this.aiExplanation = aiExplanation; return this; }
        public FacultyWorkloadAllocationBuilder confidenceScore(Integer confidenceScore) { this.confidenceScore = confidenceScore; return this; }
        public FacultyWorkloadAllocationBuilder subject(SubjectMaster subject) { this.subject = subject; return this; }
        public FacultyWorkloadAllocationBuilder active(boolean active) { this.active = active; return this; }

        public FacultyWorkloadAllocation build() {
            FacultyWorkloadAllocation a = new FacultyWorkloadAllocation();
            a.setId(id); a.setFaculty(faculty); a.setFacultyName(facultyName);
            a.setFacultyEmail(facultyEmail); a.setDepartment(department);
            a.setYear(year); a.setSemester(semester); a.setSemesterType(semesterType);
            a.setSection(section); a.setCourseCode(courseCode); a.setSubjectName(subjectName);
            a.setHoursPerWeek(hoursPerWeek); a.setCredits(credits);
            a.setAcademicYear(academicYear); a.setVersionName(versionName);
            if (status != null) a.setStatus(status);
            a.setAiExplanation(aiExplanation);
            if (confidenceScore != null) a.setConfidenceScore(confidenceScore);
            a.setSubject(subject); a.setActive(active);
            return a;
        }
    }
}
