package com.eduflow.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LectureRequest {
    private String topicTitle;
    private String topicDescription;
    private String learningObjectives;
    private LocalDate lectureDate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long attendanceSessionId;
    private List<Long> materialIds;
    private List<Long> assignmentIds;
    private List<Long> assessmentIds;
    private List<Long> codingQuestionIds;

    public String getTopicTitle() { return topicTitle; }
    public void setTopicTitle(String topicTitle) { this.topicTitle = topicTitle; }
    public String getTopicDescription() { return topicDescription; }
    public void setTopicDescription(String topicDescription) { this.topicDescription = topicDescription; }
    public String getLearningObjectives() { return learningObjectives; }
    public void setLearningObjectives(String learningObjectives) { this.learningObjectives = learningObjectives; }
    public LocalDate getLectureDate() { return lectureDate; }
    public void setLectureDate(LocalDate lectureDate) { this.lectureDate = lectureDate; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public Long getAttendanceSessionId() { return attendanceSessionId; }
    public void setAttendanceSessionId(Long attendanceSessionId) { this.attendanceSessionId = attendanceSessionId; }
    public List<Long> getMaterialIds() { return materialIds; }
    public void setMaterialIds(List<Long> materialIds) { this.materialIds = materialIds; }
    public List<Long> getAssignmentIds() { return assignmentIds; }
    public void setAssignmentIds(List<Long> assignmentIds) { this.assignmentIds = assignmentIds; }
    public List<Long> getAssessmentIds() { return assessmentIds; }
    public void setAssessmentIds(List<Long> assessmentIds) { this.assessmentIds = assessmentIds; }
    public List<Long> getCodingQuestionIds() { return codingQuestionIds; }
    public void setCodingQuestionIds(List<Long> codingQuestionIds) { this.codingQuestionIds = codingQuestionIds; }
}
