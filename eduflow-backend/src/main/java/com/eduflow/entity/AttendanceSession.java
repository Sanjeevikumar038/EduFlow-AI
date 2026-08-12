package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String subject;

    private Long facultyId;

    private String department;

    private Integer semester;

    private String section;

    private LocalDateTime startTime;

    private LocalDateTime expiryTime;

    private boolean active;

    @Transient
    private String currentOtp;

    @Transient
    private String facultyName;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getExpiryTime() { return expiryTime; }
    public void setExpiryTime(LocalDateTime expiryTime) { this.expiryTime = expiryTime; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public String getCurrentOtp() { return currentOtp; }
    public void setCurrentOtp(String currentOtp) { this.currentOtp = currentOtp; }
    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public static AttendanceSessionBuilder builder() { return new AttendanceSessionBuilder(); }
    public static class AttendanceSessionBuilder {
        private Long id;
        private String subject;
        private Long facultyId;
        private String department;
        private Integer semester;
        private String section;
        private LocalDateTime startTime;
        private LocalDateTime expiryTime;
        private boolean active;
        private String currentOtp;
        private String facultyName;

        public AttendanceSessionBuilder id(Long id) { this.id = id; return this; }
        public AttendanceSessionBuilder subject(String subject) { this.subject = subject; return this; }
        public AttendanceSessionBuilder facultyId(Long facultyId) { this.facultyId = facultyId; return this; }
        public AttendanceSessionBuilder department(String department) { this.department = department; return this; }
        public AttendanceSessionBuilder semester(Integer semester) { this.semester = semester; return this; }
        public AttendanceSessionBuilder section(String section) { this.section = section; return this; }
        public AttendanceSessionBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public AttendanceSessionBuilder expiryTime(LocalDateTime expiryTime) { this.expiryTime = expiryTime; return this; }
        public AttendanceSessionBuilder active(boolean active) { this.active = active; return this; }
        public AttendanceSessionBuilder currentOtp(String currentOtp) { this.currentOtp = currentOtp; return this; }
        public AttendanceSessionBuilder facultyName(String facultyName) { this.facultyName = facultyName; return this; }

        public AttendanceSession build() {
            AttendanceSession s = new AttendanceSession();
            s.setId(id); s.setSubject(subject); s.setFacultyId(facultyId);
            s.setDepartment(department); s.setSemester(semester); s.setSection(section);
            s.setStartTime(startTime); s.setExpiryTime(expiryTime); s.setActive(active);
            s.setCurrentOtp(currentOtp); s.setFacultyName(facultyName);
            return s;
        }
    }
}

