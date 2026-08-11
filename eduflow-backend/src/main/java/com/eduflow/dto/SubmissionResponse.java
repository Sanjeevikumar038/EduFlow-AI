package com.eduflow.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionResponse {
    private Long id;
    private Long assignmentId;
    private String assignmentTitle;
    private Integer maxMarks;
    private Long studentId;
    private String studentName;
    private String studentRegisterNumber;
    private String studentEmail;
    private String submissionUrl;
    private String submissionFileName;
    private String submissionText;
    private LocalDateTime submittedAt;
    private String status; // NOT_SUBMITTED, SUBMITTED, LATE, GRADED
    private Integer marksObtained;
    private String feedback;
    private Long gradedById;
    private String gradedByName;
    private LocalDateTime gradedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }
    public String getAssignmentTitle() { return assignmentTitle; }
    public void setAssignmentTitle(String assignmentTitle) { this.assignmentTitle = assignmentTitle; }
    public Integer getMaxMarks() { return maxMarks; }
    public void setMaxMarks(Integer maxMarks) { this.maxMarks = maxMarks; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getStudentRegisterNumber() { return studentRegisterNumber; }
    public void setStudentRegisterNumber(String studentRegisterNumber) { this.studentRegisterNumber = studentRegisterNumber; }
    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
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
    public Long getGradedById() { return gradedById; }
    public void setGradedById(Long gradedById) { this.gradedById = gradedById; }
    public String getGradedByName() { return gradedByName; }
    public void setGradedByName(String gradedByName) { this.gradedByName = gradedByName; }
    public LocalDateTime getGradedAt() { return gradedAt; }
    public void setGradedAt(LocalDateTime gradedAt) { this.gradedAt = gradedAt; }

    public static SubmissionResponseBuilder builder() { return new SubmissionResponseBuilder(); }
    public static class SubmissionResponseBuilder {
        private Long id;
        private Long assignmentId;
        private String assignmentTitle;
        private Integer maxMarks;
        private Long studentId;
        private String studentName;
        private String studentRegisterNumber;
        private String studentEmail;
        private String submissionUrl;
        private String submissionFileName;
        private String submissionText;
        private LocalDateTime submittedAt;
        private String status;
        private Integer marksObtained;
        private String feedback;
        private Long gradedById;
        private String gradedByName;
        private LocalDateTime gradedAt;

        public SubmissionResponseBuilder id(Long id) { this.id = id; return this; }
        public SubmissionResponseBuilder assignmentId(Long assignmentId) { this.assignmentId = assignmentId; return this; }
        public SubmissionResponseBuilder assignmentTitle(String assignmentTitle) { this.assignmentTitle = assignmentTitle; return this; }
        public SubmissionResponseBuilder maxMarks(Integer maxMarks) { this.maxMarks = maxMarks; return this; }
        public SubmissionResponseBuilder studentId(Long studentId) { this.studentId = studentId; return this; }
        public SubmissionResponseBuilder studentName(String studentName) { this.studentName = studentName; return this; }
        public SubmissionResponseBuilder studentRegisterNumber(String studentRegisterNumber) { this.studentRegisterNumber = studentRegisterNumber; return this; }
        public SubmissionResponseBuilder studentEmail(String studentEmail) { this.studentEmail = studentEmail; return this; }
        public SubmissionResponseBuilder submissionUrl(String submissionUrl) { this.submissionUrl = submissionUrl; return this; }
        public SubmissionResponseBuilder submissionFileName(String submissionFileName) { this.submissionFileName = submissionFileName; return this; }
        public SubmissionResponseBuilder submissionText(String submissionText) { this.submissionText = submissionText; return this; }
        public SubmissionResponseBuilder submittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; return this; }
        public SubmissionResponseBuilder status(String status) { this.status = status; return this; }
        public SubmissionResponseBuilder marksObtained(Integer marksObtained) { this.marksObtained = marksObtained; return this; }
        public SubmissionResponseBuilder feedback(String feedback) { this.feedback = feedback; return this; }
        public SubmissionResponseBuilder gradedById(Long gradedById) { this.gradedById = gradedById; return this; }
        public SubmissionResponseBuilder gradedByName(String gradedByName) { this.gradedByName = gradedByName; return this; }
        public SubmissionResponseBuilder gradedAt(LocalDateTime gradedAt) { this.gradedAt = gradedAt; return this; }

        public SubmissionResponse build() {
            SubmissionResponse r = new SubmissionResponse();
            r.setId(id); r.setAssignmentId(assignmentId); r.setAssignmentTitle(assignmentTitle);
            r.setMaxMarks(maxMarks); r.setStudentId(studentId); r.setStudentName(studentName);
            r.setStudentRegisterNumber(studentRegisterNumber); r.setStudentEmail(studentEmail);
            r.setSubmissionUrl(submissionUrl); r.setSubmissionFileName(submissionFileName);
            r.setSubmissionText(submissionText); r.setSubmittedAt(submittedAt);
            r.setStatus(status); r.setMarksObtained(marksObtained); r.setFeedback(feedback);
            r.setGradedById(gradedById); r.setGradedByName(gradedByName); r.setGradedAt(gradedAt);
            return r;
        }
    }
}
