package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "faculty_expertise",
        uniqueConstraints = @UniqueConstraint(columnNames = {"faculty_id", "subject_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyExpertise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = false)
    private User faculty;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private SubjectMaster subject;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpertiseLevel expertiseLevel;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getFaculty() { return faculty; }
    public void setFaculty(User faculty) { this.faculty = faculty; }
    public SubjectMaster getSubject() { return subject; }
    public void setSubject(SubjectMaster subject) { this.subject = subject; }
    public ExpertiseLevel getExpertiseLevel() { return expertiseLevel; }
    public void setExpertiseLevel(ExpertiseLevel expertiseLevel) { this.expertiseLevel = expertiseLevel; }

    public static FacultyExpertiseBuilder builder() { return new FacultyExpertiseBuilder(); }
    public static class FacultyExpertiseBuilder {
        private Long id;
        private User faculty;
        private SubjectMaster subject;
        private ExpertiseLevel expertiseLevel;

        public FacultyExpertiseBuilder id(Long id) { this.id = id; return this; }
        public FacultyExpertiseBuilder faculty(User faculty) { this.faculty = faculty; return this; }
        public FacultyExpertiseBuilder subject(SubjectMaster subject) { this.subject = subject; return this; }
        public FacultyExpertiseBuilder expertiseLevel(ExpertiseLevel expertiseLevel) { this.expertiseLevel = expertiseLevel; return this; }

        public FacultyExpertise build() {
            FacultyExpertise fe = new FacultyExpertise();
            fe.setId(id); fe.setFaculty(faculty); fe.setSubject(subject); fe.setExpertiseLevel(expertiseLevel);
            return fe;
        }
    }
}
