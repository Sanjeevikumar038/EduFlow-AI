package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "classroom_lecture_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassroomLectureHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id", nullable = false)
    private CourseClassroom classroom;

    private Long attendanceSessionId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = false)
    private User faculty;

    private LocalDate lectureDate;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Column(nullable = false)
    private String topicTitle;

    @Column(columnDefinition = "TEXT")
    private String topicDescription;

    @Column(columnDefinition = "TEXT")
    private String learningObjectives;

    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    @Column(columnDefinition = "TEXT")
    private String materialIdsJson; // CSV or JSON array e.g. "1,2,3"

    @Column(columnDefinition = "TEXT")
    private String assignmentIdsJson;

    @Column(columnDefinition = "TEXT")
    private String assessmentIdsJson;

    @Column(columnDefinition = "TEXT")
    private String codingQuestionIdsJson;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CourseClassroom getClassroom() { return classroom; }
    public void setClassroom(CourseClassroom classroom) { this.classroom = classroom; }
    public Long getAttendanceSessionId() { return attendanceSessionId; }
    public void setAttendanceSessionId(Long attendanceSessionId) { this.attendanceSessionId = attendanceSessionId; }
    public User getFaculty() { return faculty; }
    public void setFaculty(User faculty) { this.faculty = faculty; }
    public LocalDate getLectureDate() { return lectureDate; }
    public void setLectureDate(LocalDate lectureDate) { this.lectureDate = lectureDate; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public String getTopicTitle() { return topicTitle; }
    public void setTopicTitle(String topicTitle) { this.topicTitle = topicTitle; }
    public String getTopicDescription() { return topicDescription; }
    public void setTopicDescription(String topicDescription) { this.topicDescription = topicDescription; }
    public String getLearningObjectives() { return learningObjectives; }
    public void setLearningObjectives(String learningObjectives) { this.learningObjectives = learningObjectives; }
    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }
    public String getMaterialIdsJson() { return materialIdsJson; }
    public void setMaterialIdsJson(String materialIdsJson) { this.materialIdsJson = materialIdsJson; }
    public String getAssignmentIdsJson() { return assignmentIdsJson; }
    public void setAssignmentIdsJson(String assignmentIdsJson) { this.assignmentIdsJson = assignmentIdsJson; }
    public String getAssessmentIdsJson() { return assessmentIdsJson; }
    public void setAssessmentIdsJson(String assessmentIdsJson) { this.assessmentIdsJson = assessmentIdsJson; }
    public String getCodingQuestionIdsJson() { return codingQuestionIdsJson; }
    public void setCodingQuestionIdsJson(String codingQuestionIdsJson) { this.codingQuestionIdsJson = codingQuestionIdsJson; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static ClassroomLectureHistoryBuilder builder() { return new ClassroomLectureHistoryBuilder(); }
    public static class ClassroomLectureHistoryBuilder {
        private Long id;
        private CourseClassroom classroom;
        private Long attendanceSessionId;
        private User faculty;
        private LocalDate lectureDate;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String topicTitle;
        private String topicDescription;
        private String learningObjectives;
        private String aiSummary;
        private String materialIdsJson;
        private String assignmentIdsJson;
        private String assessmentIdsJson;
        private String codingQuestionIdsJson;
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime updatedAt;

        public ClassroomLectureHistoryBuilder id(Long id) { this.id = id; return this; }
        public ClassroomLectureHistoryBuilder classroom(CourseClassroom classroom) { this.classroom = classroom; return this; }
        public ClassroomLectureHistoryBuilder attendanceSessionId(Long attendanceSessionId) { this.attendanceSessionId = attendanceSessionId; return this; }
        public ClassroomLectureHistoryBuilder faculty(User faculty) { this.faculty = faculty; return this; }
        public ClassroomLectureHistoryBuilder lectureDate(LocalDate lectureDate) { this.lectureDate = lectureDate; return this; }
        public ClassroomLectureHistoryBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public ClassroomLectureHistoryBuilder endTime(LocalDateTime endTime) { this.endTime = endTime; return this; }
        public ClassroomLectureHistoryBuilder topicTitle(String topicTitle) { this.topicTitle = topicTitle; return this; }
        public ClassroomLectureHistoryBuilder topicDescription(String topicDescription) { this.topicDescription = topicDescription; return this; }
        public ClassroomLectureHistoryBuilder learningObjectives(String learningObjectives) { this.learningObjectives = learningObjectives; return this; }
        public ClassroomLectureHistoryBuilder aiSummary(String aiSummary) { this.aiSummary = aiSummary; return this; }
        public ClassroomLectureHistoryBuilder materialIdsJson(String materialIdsJson) { this.materialIdsJson = materialIdsJson; return this; }
        public ClassroomLectureHistoryBuilder assignmentIdsJson(String assignmentIdsJson) { this.assignmentIdsJson = assignmentIdsJson; return this; }
        public ClassroomLectureHistoryBuilder assessmentIdsJson(String assessmentIdsJson) { this.assessmentIdsJson = assessmentIdsJson; return this; }
        public ClassroomLectureHistoryBuilder codingQuestionIdsJson(String codingQuestionIdsJson) { this.codingQuestionIdsJson = codingQuestionIdsJson; return this; }
        public ClassroomLectureHistoryBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ClassroomLectureHistoryBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public ClassroomLectureHistory build() {
            ClassroomLectureHistory h = new ClassroomLectureHistory();
            h.setId(id); h.setClassroom(classroom); h.setAttendanceSessionId(attendanceSessionId);
            h.setFaculty(faculty); h.setLectureDate(lectureDate); h.setStartTime(startTime);
            h.setEndTime(endTime); h.setTopicTitle(topicTitle); h.setTopicDescription(topicDescription);
            h.setLearningObjectives(learningObjectives); h.setAiSummary(aiSummary);
            h.setMaterialIdsJson(materialIdsJson); h.setAssignmentIdsJson(assignmentIdsJson);
            h.setAssessmentIdsJson(assessmentIdsJson); h.setCodingQuestionIdsJson(codingQuestionIdsJson);
            h.setCreatedAt(createdAt); h.setUpdatedAt(updatedAt);
            return h;
        }
    }
}
