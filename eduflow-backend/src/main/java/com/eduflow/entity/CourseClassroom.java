package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_classrooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseClassroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String subjectCode;

    @Column(nullable = false)
    private String subjectName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id")
    private User faculty;

    private String department;

    private Integer semester;

    private String section; // e.g., "A", "B"

    private String academicYear; // e.g., "2024-2025" or "2024-2029"

    private String bannerColor; // e.g., "#3f51b5", "#009688", "#e91e63"

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private boolean active = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }
    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public User getFaculty() { return faculty; }
    public void setFaculty(User faculty) { this.faculty = faculty; }
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
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public static CourseClassroomBuilder builder() { return new CourseClassroomBuilder(); }
    public static class CourseClassroomBuilder {
        private Long id;
        private String subjectCode;
        private String subjectName;
        private User faculty;
        private String department;
        private Integer semester;
        private String section;
        private String academicYear;
        private String bannerColor;
        private LocalDateTime createdAt = LocalDateTime.now();
        private boolean active = true;

        public CourseClassroomBuilder id(Long id) { this.id = id; return this; }
        public CourseClassroomBuilder subjectCode(String subjectCode) { this.subjectCode = subjectCode; return this; }
        public CourseClassroomBuilder subjectName(String subjectName) { this.subjectName = subjectName; return this; }
        public CourseClassroomBuilder faculty(User faculty) { this.faculty = faculty; return this; }
        public CourseClassroomBuilder department(String department) { this.department = department; return this; }
        public CourseClassroomBuilder semester(Integer semester) { this.semester = semester; return this; }
        public CourseClassroomBuilder section(String section) { this.section = section; return this; }
        public CourseClassroomBuilder academicYear(String academicYear) { this.academicYear = academicYear; return this; }
        public CourseClassroomBuilder bannerColor(String bannerColor) { this.bannerColor = bannerColor; return this; }
        public CourseClassroomBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public CourseClassroomBuilder active(boolean active) { this.active = active; return this; }

        public CourseClassroom build() {
            CourseClassroom c = new CourseClassroom();
            c.setId(id); c.setSubjectCode(subjectCode); c.setSubjectName(subjectName);
            c.setFaculty(faculty); c.setDepartment(department); c.setSemester(semester);
            c.setSection(section); c.setAcademicYear(academicYear); c.setBannerColor(bannerColor);
            if (createdAt != null) c.setCreatedAt(createdAt);
            c.setActive(active);
            return c;
        }
    }
}
