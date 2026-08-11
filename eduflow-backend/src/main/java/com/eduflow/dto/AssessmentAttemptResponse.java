package com.eduflow.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentAttemptResponse {
    private Long id;
    private Long assessmentId;
    private String assessmentTitle;
    private String assessmentType;
    private Integer totalMarks;
    private Integer passMarks;
    private Long studentId;
    private String studentName;
    private String studentRegisterNumber;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Double totalScore;
    private String status; // IN_PROGRESS, SUBMITTED, AUTO_SUBMITTED, GRADED
    private String answersJson;
    private String feedback;
    private String gradedByName;
    private LocalDateTime gradedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAssessmentId() { return assessmentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }
    public String getAssessmentTitle() { return assessmentTitle; }
    public void setAssessmentTitle(String assessmentTitle) { this.assessmentTitle = assessmentTitle; }
    public String getAssessmentType() { return assessmentType; }
    public void setAssessmentType(String assessmentType) { this.assessmentType = assessmentType; }
    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
    public Integer getPassMarks() { return passMarks; }
    public void setPassMarks(Integer passMarks) { this.passMarks = passMarks; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getStudentRegisterNumber() { return studentRegisterNumber; }
    public void setStudentRegisterNumber(String studentRegisterNumber) { this.studentRegisterNumber = studentRegisterNumber; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public Double getTotalScore() { return totalScore; }
    public void setTotalScore(Double totalScore) { this.totalScore = totalScore; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAnswersJson() { return answersJson; }
    public void setAnswersJson(String answersJson) { this.answersJson = answersJson; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public String getGradedByName() { return gradedByName; }
    public void setGradedByName(String gradedByName) { this.gradedByName = gradedByName; }
    public LocalDateTime getGradedAt() { return gradedAt; }
    public void setGradedAt(LocalDateTime gradedAt) { this.gradedAt = gradedAt; }

    public static AssessmentAttemptResponseBuilder builder() { return new AssessmentAttemptResponseBuilder(); }
    public static class AssessmentAttemptResponseBuilder {
        private Long id;
        private Long assessmentId;
        private String assessmentTitle;
        private String assessmentType;
        private Integer totalMarks;
        private Integer passMarks;
        private Long studentId;
        private String studentName;
        private String studentRegisterNumber;
        private LocalDateTime startedAt;
        private LocalDateTime submittedAt;
        private Double totalScore;
        private String status;
        private String answersJson;
        private String feedback;
        private String gradedByName;
        private LocalDateTime gradedAt;

        public AssessmentAttemptResponseBuilder id(Long id) { this.id = id; return this; }
        public AssessmentAttemptResponseBuilder assessmentId(Long assessmentId) { this.assessmentId = assessmentId; return this; }
        public AssessmentAttemptResponseBuilder assessmentTitle(String assessmentTitle) { this.assessmentTitle = assessmentTitle; return this; }
        public AssessmentAttemptResponseBuilder assessmentType(String assessmentType) { this.assessmentType = assessmentType; return this; }
        public AssessmentAttemptResponseBuilder totalMarks(Integer totalMarks) { this.totalMarks = totalMarks; return this; }
        public AssessmentAttemptResponseBuilder passMarks(Integer passMarks) { this.passMarks = passMarks; return this; }
        public AssessmentAttemptResponseBuilder studentId(Long studentId) { this.studentId = studentId; return this; }
        public AssessmentAttemptResponseBuilder studentName(String studentName) { this.studentName = studentName; return this; }
        public AssessmentAttemptResponseBuilder studentRegisterNumber(String studentRegisterNumber) { this.studentRegisterNumber = studentRegisterNumber; return this; }
        public AssessmentAttemptResponseBuilder startedAt(LocalDateTime startedAt) { this.startedAt = startedAt; return this; }
        public AssessmentAttemptResponseBuilder submittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; return this; }
        public AssessmentAttemptResponseBuilder totalScore(Double totalScore) { this.totalScore = totalScore; return this; }
        public AssessmentAttemptResponseBuilder status(String status) { this.status = status; return this; }
        public AssessmentAttemptResponseBuilder answersJson(String answersJson) { this.answersJson = answersJson; return this; }
        public AssessmentAttemptResponseBuilder feedback(String feedback) { this.feedback = feedback; return this; }
        public AssessmentAttemptResponseBuilder gradedByName(String gradedByName) { this.gradedByName = gradedByName; return this; }
        public AssessmentAttemptResponseBuilder gradedAt(LocalDateTime gradedAt) { this.gradedAt = gradedAt; return this; }

        public AssessmentAttemptResponse build() {
            AssessmentAttemptResponse r = new AssessmentAttemptResponse();
            r.setId(id); r.setAssessmentId(assessmentId); r.setAssessmentTitle(assessmentTitle);
            r.setAssessmentType(assessmentType); r.setTotalMarks(totalMarks); r.setPassMarks(passMarks);
            r.setStudentId(studentId); r.setStudentName(studentName);
            r.setStudentRegisterNumber(studentRegisterNumber); r.setStartedAt(startedAt);
            r.setSubmittedAt(submittedAt); r.setTotalScore(totalScore); r.setStatus(status);
            r.setAnswersJson(answersJson); r.setFeedback(feedback);
            r.setGradedByName(gradedByName); r.setGradedAt(gradedAt);
            return r;
        }
    }
}
