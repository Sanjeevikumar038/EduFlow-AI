package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "timetable_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String department;

    private String dayOfWeek; // e.g., "Monday"

    private Integer period; // 1 to 8

    private String subject; // e.g., "OS", "DCN", etc.

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = true)
    private User faculty;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "version_id", nullable = true)
    private TimetableVersion version;

    @com.fasterxml.jackson.annotation.JsonProperty("versionId")
    public Long getVersionId() {
        return version != null ? version.getId() : null;
    }

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = true)
    private Classroom room;

    private Integer semester;

    private String academicYear;

    private String section;

    private String activityName;

    @Transient
    private String subjectName;

    @Transient
    private String courseCode;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public Integer getPeriod() { return period; }
    public void setPeriod(Integer period) { this.period = period; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public User getFaculty() { return faculty; }
    public void setFaculty(User faculty) { this.faculty = faculty; }
    public TimetableVersion getVersion() { return version; }
    public void setVersion(TimetableVersion version) { this.version = version; }
    public Classroom getRoom() { return room; }
    public void setRoom(Classroom room) { this.room = room; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getActivityName() { return activityName; }
    public void setActivityName(String activityName) { this.activityName = activityName; }
    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public static TimetableEntryBuilder builder() { return new TimetableEntryBuilder(); }
    public static class TimetableEntryBuilder {
        private Long id;
        private String department;
        private String dayOfWeek;
        private Integer period;
        private String subject;
        private User faculty;
        private TimetableVersion version;
        private Classroom room;
        private Integer semester;
        private String academicYear;
        private String section;
        private String activityName;
        private String subjectName;
        private String courseCode;

        public TimetableEntryBuilder id(Long id) { this.id = id; return this; }
        public TimetableEntryBuilder department(String department) { this.department = department; return this; }
        public TimetableEntryBuilder dayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; return this; }
        public TimetableEntryBuilder period(Integer period) { this.period = period; return this; }
        public TimetableEntryBuilder subject(String subject) { this.subject = subject; return this; }
        public TimetableEntryBuilder faculty(User faculty) { this.faculty = faculty; return this; }
        public TimetableEntryBuilder version(TimetableVersion version) { this.version = version; return this; }
        public TimetableEntryBuilder room(Classroom room) { this.room = room; return this; }
        public TimetableEntryBuilder semester(Integer semester) { this.semester = semester; return this; }
        public TimetableEntryBuilder academicYear(String academicYear) { this.academicYear = academicYear; return this; }
        public TimetableEntryBuilder section(String section) { this.section = section; return this; }
        public TimetableEntryBuilder activityName(String activityName) { this.activityName = activityName; return this; }
        public TimetableEntryBuilder subjectName(String subjectName) { this.subjectName = subjectName; return this; }
        public TimetableEntryBuilder courseCode(String courseCode) { this.courseCode = courseCode; return this; }

        public TimetableEntry build() {
            TimetableEntry e = new TimetableEntry();
            e.setId(id); e.setDepartment(department); e.setDayOfWeek(dayOfWeek);
            e.setPeriod(period); e.setSubject(subject); e.setFaculty(faculty);
            e.setVersion(version); e.setRoom(room); e.setSemester(semester);
            e.setAcademicYear(academicYear); e.setSection(section); e.setActivityName(activityName);
            e.setSubjectName(subjectName); e.setCourseCode(courseCode);
            return e;
        }
    }
}
