package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "timetable_versions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String department;

    private Integer semester;

    private String academicYear;

    @Column(nullable = false)
    private String versionName;

    @Builder.Default
    private LocalDateTime createdDate = LocalDateTime.now();

    @Builder.Default
    private boolean active = false;

    private String status = "DRAFT";

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public String getVersionName() { return versionName; }
    public void setVersionName(String versionName) { this.versionName = versionName; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public static TimetableVersionBuilder builder() { return new TimetableVersionBuilder(); }
    public static class TimetableVersionBuilder {
        private Long id;
        private String department;
        private Integer semester;
        private String academicYear;
        private String versionName;
        private String status = "DRAFT";
        private LocalDateTime createdDate = LocalDateTime.now();
        private boolean active = false;

        public TimetableVersionBuilder id(Long id) { this.id = id; return this; }
        public TimetableVersionBuilder department(String department) { this.department = department; return this; }
        public TimetableVersionBuilder semester(Integer semester) { this.semester = semester; return this; }
        public TimetableVersionBuilder academicYear(String academicYear) { this.academicYear = academicYear; return this; }
        public TimetableVersionBuilder versionName(String versionName) { this.versionName = versionName; return this; }
        public TimetableVersionBuilder status(String status) { this.status = status; return this; }
        public TimetableVersionBuilder createdDate(LocalDateTime createdDate) { this.createdDate = createdDate; return this; }
        public TimetableVersionBuilder active(boolean active) { this.active = active; return this; }

        public TimetableVersion build() {
            TimetableVersion v = new TimetableVersion();
            v.setId(id); v.setDepartment(department); v.setSemester(semester);
            v.setAcademicYear(academicYear); v.setVersionName(versionName);
            if (status != null) v.setStatus(status);
            if (createdDate != null) v.setCreatedDate(createdDate);
            v.setActive(active);
            return v;
        }
    }
}
