package com.eduflow.dto;

import com.eduflow.entity.SubjectCategory;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubjectMasterRequest {
    private String subjectCode;
    private String subjectName;
    private String department;
    private Integer semester;
    private String academicYear;
    private Integer credits;
    private Integer weeklyHours;
    private Object subjectCategory;

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
    public Object getSubjectCategory() { return subjectCategory; }
    public void setSubjectCategory(Object subjectCategory) { this.subjectCategory = subjectCategory; }
}
