package com.eduflow.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseClassroomResponse {

    private Long id;
    private String subjectCode;
    private String subjectName;
    private Long facultyId;
    private String facultyName;
    private String facultyEmail;
    private String department;
    private Integer semester;
    private String section;
    private String academicYear;
    private String bannerColor;
    private long studentCount;
    private long announcementCount;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }
    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }
    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }
    public String getFacultyEmail() { return facultyEmail; }
    public void setFacultyEmail(String facultyEmail) { this.facultyEmail = facultyEmail; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public String getBannerColor() { return bannerColor; }
    public void setBannerColor(String bannerColor) { this.bannerColor = bannerColor; }
    public long getStudentCount() { return studentCount; }
    public void setStudentCount(long studentCount) { this.studentCount = studentCount; }
    public long getAnnouncementCount() { return announcementCount; }
    public void setAnnouncementCount(long announcementCount) { this.announcementCount = announcementCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static CourseClassroomResponseBuilder builder() { return new CourseClassroomResponseBuilder(); }
    public static class CourseClassroomResponseBuilder {
        private Long id;
        private String subjectCode;
        private String subjectName;
        private Long facultyId;
        private String facultyName;
        private String facultyEmail;
        private String department;
        private Integer semester;
        private String section;
        private String academicYear;
        private String bannerColor;
        private long studentCount;
        private long announcementCount;
        private LocalDateTime createdAt;

        public CourseClassroomResponseBuilder id(Long id) { this.id = id; return this; }
        public CourseClassroomResponseBuilder subjectCode(String subjectCode) { this.subjectCode = subjectCode; return this; }
        public CourseClassroomResponseBuilder subjectName(String subjectName) { this.subjectName = subjectName; return this; }
        public CourseClassroomResponseBuilder facultyId(Long facultyId) { this.facultyId = facultyId; return this; }
        public CourseClassroomResponseBuilder facultyName(String facultyName) { this.facultyName = facultyName; return this; }
        public CourseClassroomResponseBuilder facultyEmail(String facultyEmail) { this.facultyEmail = facultyEmail; return this; }
        public CourseClassroomResponseBuilder department(String department) { this.department = department; return this; }
        public CourseClassroomResponseBuilder semester(Integer semester) { this.semester = semester; return this; }
        public CourseClassroomResponseBuilder section(String section) { this.section = section; return this; }
        public CourseClassroomResponseBuilder academicYear(String academicYear) { this.academicYear = academicYear; return this; }
        public CourseClassroomResponseBuilder bannerColor(String bannerColor) { this.bannerColor = bannerColor; return this; }
        public CourseClassroomResponseBuilder studentCount(long studentCount) { this.studentCount = studentCount; return this; }
        public CourseClassroomResponseBuilder announcementCount(long announcementCount) { this.announcementCount = announcementCount; return this; }
        public CourseClassroomResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public CourseClassroomResponse build() {
            CourseClassroomResponse r = new CourseClassroomResponse();
            r.setId(id); r.setSubjectCode(subjectCode); r.setSubjectName(subjectName);
            r.setFacultyId(facultyId); r.setFacultyName(facultyName); r.setFacultyEmail(facultyEmail);
            r.setDepartment(department); r.setSemester(semester); r.setSection(section);
            r.setAcademicYear(academicYear); r.setBannerColor(bannerColor);
            r.setStudentCount(studentCount); r.setAnnouncementCount(announcementCount);
            r.setCreatedAt(createdAt);
            return r;
        }
    }
}
