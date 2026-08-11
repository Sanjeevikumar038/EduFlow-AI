package com.eduflow.dto;

import com.eduflow.entity.CodingQuestionBank;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LectureResponse {
    private Long id;
    private Long classroomId;
    private String subjectName;
    private String subjectCode;
    private Long attendanceSessionId;
    private Long facultyId;
    private String facultyName;
    private LocalDate lectureDate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String topicTitle;
    private String topicDescription;
    private String learningObjectives;
    private String aiSummary;
    private List<MaterialResponse> materials;
    private List<AssignmentResponse> assignments;
    private List<AssessmentResponse> assessments;
    private List<CodingQuestionBank> codingTasks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getClassroomId() { return classroomId; }
    public void setClassroomId(Long classroomId) { this.classroomId = classroomId; }
    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }
    public Long getAttendanceSessionId() { return attendanceSessionId; }
    public void setAttendanceSessionId(Long attendanceSessionId) { this.attendanceSessionId = attendanceSessionId; }
    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }
    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }
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
    public List<MaterialResponse> getMaterials() { return materials; }
    public void setMaterials(List<MaterialResponse> materials) { this.materials = materials; }
    public List<AssignmentResponse> getAssignments() { return assignments; }
    public void setAssignments(List<AssignmentResponse> assignments) { this.assignments = assignments; }
    public List<AssessmentResponse> getAssessments() { return assessments; }
    public void setAssessments(List<AssessmentResponse> assessments) { this.assessments = assessments; }
    public List<CodingQuestionBank> getCodingTasks() { return codingTasks; }
    public void setCodingTasks(List<CodingQuestionBank> codingTasks) { this.codingTasks = codingTasks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static LectureResponseBuilder builder() { return new LectureResponseBuilder(); }
    public static class LectureResponseBuilder {
        private Long id;
        private Long classroomId;
        private String subjectName;
        private String subjectCode;
        private Long attendanceSessionId;
        private Long facultyId;
        private String facultyName;
        private LocalDate lectureDate;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String topicTitle;
        private String topicDescription;
        private String learningObjectives;
        private String aiSummary;
        private List<MaterialResponse> materials;
        private List<AssignmentResponse> assignments;
        private List<AssessmentResponse> assessments;
        private List<CodingQuestionBank> codingTasks;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public LectureResponseBuilder id(Long id) { this.id = id; return this; }
        public LectureResponseBuilder classroomId(Long classroomId) { this.classroomId = classroomId; return this; }
        public LectureResponseBuilder subjectName(String subjectName) { this.subjectName = subjectName; return this; }
        public LectureResponseBuilder subjectCode(String subjectCode) { this.subjectCode = subjectCode; return this; }
        public LectureResponseBuilder attendanceSessionId(Long attendanceSessionId) { this.attendanceSessionId = attendanceSessionId; return this; }
        public LectureResponseBuilder facultyId(Long facultyId) { this.facultyId = facultyId; return this; }
        public LectureResponseBuilder facultyName(String facultyName) { this.facultyName = facultyName; return this; }
        public LectureResponseBuilder lectureDate(LocalDate lectureDate) { this.lectureDate = lectureDate; return this; }
        public LectureResponseBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public LectureResponseBuilder endTime(LocalDateTime endTime) { this.endTime = endTime; return this; }
        public LectureResponseBuilder topicTitle(String topicTitle) { this.topicTitle = topicTitle; return this; }
        public LectureResponseBuilder topicDescription(String topicDescription) { this.topicDescription = topicDescription; return this; }
        public LectureResponseBuilder learningObjectives(String learningObjectives) { this.learningObjectives = learningObjectives; return this; }
        public LectureResponseBuilder aiSummary(String aiSummary) { this.aiSummary = aiSummary; return this; }
        public LectureResponseBuilder materials(List<MaterialResponse> materials) { this.materials = materials; return this; }
        public LectureResponseBuilder assignments(List<AssignmentResponse> assignments) { this.assignments = assignments; return this; }
        public LectureResponseBuilder assessments(List<AssessmentResponse> assessments) { this.assessments = assessments; return this; }
        public LectureResponseBuilder codingTasks(List<CodingQuestionBank> codingTasks) { this.codingTasks = codingTasks; return this; }
        public LectureResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public LectureResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public LectureResponse build() {
            LectureResponse r = new LectureResponse();
            r.setId(id); r.setClassroomId(classroomId); r.setSubjectName(subjectName);
            r.setSubjectCode(subjectCode); r.setAttendanceSessionId(attendanceSessionId);
            r.setFacultyId(facultyId); r.setFacultyName(facultyName); r.setLectureDate(lectureDate);
            r.setStartTime(startTime); r.setEndTime(endTime); r.setTopicTitle(topicTitle);
            r.setTopicDescription(topicDescription); r.setLearningObjectives(learningObjectives);
            r.setAiSummary(aiSummary); r.setMaterials(materials); r.setAssignments(assignments);
            r.setAssessments(assessments); r.setCodingTasks(codingTasks);
            r.setCreatedAt(createdAt); r.setUpdatedAt(updatedAt);
            return r;
        }
    }
}
