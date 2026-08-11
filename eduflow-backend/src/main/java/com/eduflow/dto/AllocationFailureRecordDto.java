package com.eduflow.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocationFailureRecordDto {
    private String courseCode;
    private String subjectName;
    private String department;
    private Integer semester;
    private String section;
    private String reason;

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public static AllocationFailureRecordDtoBuilder builder() { return new AllocationFailureRecordDtoBuilder(); }
    public static class AllocationFailureRecordDtoBuilder {
        private String courseCode;
        private String subjectName;
        private String department;
        private Integer semester;
        private String section;
        private String reason;

        public AllocationFailureRecordDtoBuilder courseCode(String courseCode) { this.courseCode = courseCode; return this; }
        public AllocationFailureRecordDtoBuilder subjectName(String subjectName) { this.subjectName = subjectName; return this; }
        public AllocationFailureRecordDtoBuilder department(String department) { this.department = department; return this; }
        public AllocationFailureRecordDtoBuilder semester(Integer semester) { this.semester = semester; return this; }
        public AllocationFailureRecordDtoBuilder section(String section) { this.section = section; return this; }
        public AllocationFailureRecordDtoBuilder reason(String reason) { this.reason = reason; return this; }

        public AllocationFailureRecordDto build() {
            AllocationFailureRecordDto dto = new AllocationFailureRecordDto();
            dto.setCourseCode(courseCode); dto.setSubjectName(subjectName);
            dto.setDepartment(department); dto.setSemester(semester);
            dto.setSection(section); dto.setReason(reason);
            return dto;
        }
    }
}
