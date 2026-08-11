package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "classroom_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassroomSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private ClassroomAssignment assignment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(columnDefinition = "LONGTEXT")
    private String submissionUrl;

    private String submissionFileName;

    @Column(columnDefinition = "LONGTEXT")
    private String submissionText;

    @Builder.Default
    private LocalDateTime submittedAt = LocalDateTime.now();

    // NOT_SUBMITTED, SUBMITTED, LATE, GRADED
    @Builder.Default
    private String status = "SUBMITTED";

    private Integer marksObtained;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "graded_by_id")
    private User gradedBy;

    private LocalDateTime gradedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ClassroomAssignment getAssignment() { return assignment; }
    public void setAssignment(ClassroomAssignment assignment) { this.assignment = assignment; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public String getSubmissionUrl() { return submissionUrl; }
    public void setSubmissionUrl(String submissionUrl) { this.submissionUrl = submissionUrl; }
    public String getSubmissionFileName() { return submissionFileName; }
    public void setSubmissionFileName(String submissionFileName) { this.submissionFileName = submissionFileName; }
    public String getSubmissionText() { return submissionText; }
    public void setSubmissionText(String submissionText) { this.submissionText = submissionText; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getMarksObtained() { return marksObtained; }
    public void setMarksObtained(Integer marksObtained) { this.marksObtained = marksObtained; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public User getGradedBy() { return gradedBy; }
    public void setGradedBy(User gradedBy) { this.gradedBy = gradedBy; }
    public LocalDateTime getGradedAt() { return gradedAt; }
    public void setGradedAt(LocalDateTime gradedAt) { this.gradedAt = gradedAt; }

    public static ClassroomSubmissionBuilder builder() { return new ClassroomSubmissionBuilder(); }
    public static class ClassroomSubmissionBuilder {
        private Long id;
        private ClassroomAssignment assignment;
        private User student;
        private String submissionUrl;
        private String submissionFileName;
        private String submissionText;
        private LocalDateTime submittedAt = LocalDateTime.now();
        private String status = "SUBMITTED";
        private Integer marksObtained;
        private String feedback;
        private User gradedBy;
        private LocalDateTime gradedAt;

        public ClassroomSubmissionBuilder id(Long id) { this.id = id; return this; }
        public ClassroomSubmissionBuilder assignment(ClassroomAssignment assignment) { this.assignment = assignment; return this; }
        public ClassroomSubmissionBuilder student(User student) { this.student = student; return this; }
        public ClassroomSubmissionBuilder submissionUrl(String submissionUrl) { this.submissionUrl = submissionUrl; return this; }
        public ClassroomSubmissionBuilder submissionFileName(String submissionFileName) { this.submissionFileName = submissionFileName; return this; }
        public ClassroomSubmissionBuilder submissionText(String submissionText) { this.submissionText = submissionText; return this; }
        public ClassroomSubmissionBuilder submittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; return this; }
        public ClassroomSubmissionBuilder status(String status) { this.status = status; return this; }
        public ClassroomSubmissionBuilder marksObtained(Integer marksObtained) { this.marksObtained = marksObtained; return this; }
        public ClassroomSubmissionBuilder feedback(String feedback) { this.feedback = feedback; return this; }
        public ClassroomSubmissionBuilder gradedBy(User gradedBy) { this.gradedBy = gradedBy; return this; }
        public ClassroomSubmissionBuilder gradedAt(LocalDateTime gradedAt) { this.gradedAt = gradedAt; return this; }

        public ClassroomSubmission build() {
            ClassroomSubmission s = new ClassroomSubmission();
            s.setId(id); s.setAssignment(assignment); s.setStudent(student);
            s.setSubmissionUrl(submissionUrl); s.setSubmissionFileName(submissionFileName);
            s.setSubmissionText(submissionText);
            if (submittedAt != null) s.setSubmittedAt(submittedAt);
            if (status != null) s.setStatus(status);
            s.setMarksObtained(marksObtained); s.setFeedback(feedback);
            s.setGradedBy(gradedBy); s.setGradedAt(gradedAt);
            return s;
        }
    }
}
