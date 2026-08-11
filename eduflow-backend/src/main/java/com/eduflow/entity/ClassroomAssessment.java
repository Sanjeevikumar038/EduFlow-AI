package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "classroom_assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassroomAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id", nullable = false)
    private CourseClassroom classroom;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // MCQ, PROGRAMMING, SHORT_ANSWER
    @Column(nullable = false)
    private String assessmentType;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Builder.Default
    private Integer durationMinutes = 30;

    @Builder.Default
    private Integer totalMarks = 100;

    @Builder.Default
    private Integer passMarks = 40;

    @Builder.Default
    private boolean shuffleQuestions = true;

    @Builder.Default
    private boolean shuffleOptions = true;

    @Builder.Default
    private boolean autoPublishResult = true;

    @Builder.Default
    private Double negativeMarking = 0.0;

    // DRAFT, PUBLISHED, COMPLETED
    @Builder.Default
    private String status = "PUBLISHED";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AssessmentQuestion> questionsList;

    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AssessmentAttempt> attemptsList;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CourseClassroom getClassroom() { return classroom; }
    public void setClassroom(CourseClassroom classroom) { this.classroom = classroom; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAssessmentType() { return assessmentType; }
    public void setAssessmentType(String assessmentType) { this.assessmentType = assessmentType; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
    public Integer getPassMarks() { return passMarks; }
    public void setPassMarks(Integer passMarks) { this.passMarks = passMarks; }
    public boolean isShuffleQuestions() { return shuffleQuestions; }
    public void setShuffleQuestions(boolean shuffleQuestions) { this.shuffleQuestions = shuffleQuestions; }
    public boolean isShuffleOptions() { return shuffleOptions; }
    public void setShuffleOptions(boolean shuffleOptions) { this.shuffleOptions = shuffleOptions; }
    public boolean isAutoPublishResult() { return autoPublishResult; }
    public void setAutoPublishResult(boolean autoPublishResult) { this.autoPublishResult = autoPublishResult; }
    public Double getNegativeMarking() { return negativeMarking; }
    public void setNegativeMarking(Double negativeMarking) { this.negativeMarking = negativeMarking; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static ClassroomAssessmentBuilder builder() { return new ClassroomAssessmentBuilder(); }
    public static class ClassroomAssessmentBuilder {
        private Long id;
        private CourseClassroom classroom;
        private String title;
        private String description;
        private String assessmentType;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Integer durationMinutes = 30;
        private Integer totalMarks = 100;
        private Integer passMarks = 40;
        private boolean shuffleQuestions = true;
        private boolean shuffleOptions = true;
        private boolean autoPublishResult = true;
        private Double negativeMarking = 0.0;
        private String status = "PUBLISHED";
        private User createdBy;
        private LocalDateTime createdAt = LocalDateTime.now();

        public ClassroomAssessmentBuilder id(Long id) { this.id = id; return this; }
        public ClassroomAssessmentBuilder classroom(CourseClassroom classroom) { this.classroom = classroom; return this; }
        public ClassroomAssessmentBuilder title(String title) { this.title = title; return this; }
        public ClassroomAssessmentBuilder description(String description) { this.description = description; return this; }
        public ClassroomAssessmentBuilder assessmentType(String assessmentType) { this.assessmentType = assessmentType; return this; }
        public ClassroomAssessmentBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public ClassroomAssessmentBuilder endTime(LocalDateTime endTime) { this.endTime = endTime; return this; }
        public ClassroomAssessmentBuilder durationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; return this; }
        public ClassroomAssessmentBuilder totalMarks(Integer totalMarks) { this.totalMarks = totalMarks; return this; }
        public ClassroomAssessmentBuilder passMarks(Integer passMarks) { this.passMarks = passMarks; return this; }
        public ClassroomAssessmentBuilder shuffleQuestions(boolean shuffleQuestions) { this.shuffleQuestions = shuffleQuestions; return this; }
        public ClassroomAssessmentBuilder shuffleOptions(boolean shuffleOptions) { this.shuffleOptions = shuffleOptions; return this; }
        public ClassroomAssessmentBuilder autoPublishResult(boolean autoPublishResult) { this.autoPublishResult = autoPublishResult; return this; }
        public ClassroomAssessmentBuilder negativeMarking(Double negativeMarking) { this.negativeMarking = negativeMarking; return this; }
        public ClassroomAssessmentBuilder status(String status) { this.status = status; return this; }
        public ClassroomAssessmentBuilder createdBy(User createdBy) { this.createdBy = createdBy; return this; }
        public ClassroomAssessmentBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public ClassroomAssessment build() {
            ClassroomAssessment a = new ClassroomAssessment();
            a.setId(id); a.setClassroom(classroom); a.setTitle(title);
            a.setDescription(description); a.setAssessmentType(assessmentType);
            a.setStartTime(startTime); a.setEndTime(endTime);
            if (durationMinutes != null) a.setDurationMinutes(durationMinutes);
            if (totalMarks != null) a.setTotalMarks(totalMarks);
            if (passMarks != null) a.setPassMarks(passMarks);
            a.setShuffleQuestions(shuffleQuestions); a.setShuffleOptions(shuffleOptions);
            a.setAutoPublishResult(autoPublishResult);
            if (negativeMarking != null) a.setNegativeMarking(negativeMarking);
            if (status != null) a.setStatus(status);
            a.setCreatedBy(createdBy);
            if (createdAt != null) a.setCreatedAt(createdAt);
            return a;
        }
    }
}
