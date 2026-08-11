package com.eduflow.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentResponse {
    private Long id;
    private Long classroomId;
    private String title;
    private String instructions;
    private String attachmentUrl;
    private String attachmentName;
    private LocalDateTime dueDate;
    private Integer maxMarks;
    private boolean allowLateSubmission;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long submissionCount;
    private long gradedCount;
    private SubmissionResponse mySubmission;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getClassroomId() { return classroomId; }
    public void setClassroomId(Long classroomId) { this.classroomId = classroomId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }
    public String getAttachmentName() { return attachmentName; }
    public void setAttachmentName(String attachmentName) { this.attachmentName = attachmentName; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public Integer getMaxMarks() { return maxMarks; }
    public void setMaxMarks(Integer maxMarks) { this.maxMarks = maxMarks; }
    public boolean isAllowLateSubmission() { return allowLateSubmission; }
    public void setAllowLateSubmission(boolean allowLateSubmission) { this.allowLateSubmission = allowLateSubmission; }
    public Long getCreatedById() { return createdById; }
    public void setCreatedById(Long createdById) { this.createdById = createdById; }
    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public long getSubmissionCount() { return submissionCount; }
    public void setSubmissionCount(long submissionCount) { this.submissionCount = submissionCount; }
    public long getGradedCount() { return gradedCount; }
    public void setGradedCount(long gradedCount) { this.gradedCount = gradedCount; }
    public SubmissionResponse getMySubmission() { return mySubmission; }
    public void setMySubmission(SubmissionResponse mySubmission) { this.mySubmission = mySubmission; }

    public static AssignmentResponseBuilder builder() { return new AssignmentResponseBuilder(); }
    public static class AssignmentResponseBuilder {
        private Long id;
        private Long classroomId;
        private String title;
        private String instructions;
        private String attachmentUrl;
        private String attachmentName;
        private LocalDateTime dueDate;
        private Integer maxMarks;
        private boolean allowLateSubmission;
        private Long createdById;
        private String createdByName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private long submissionCount;
        private long gradedCount;
        private SubmissionResponse mySubmission;

        public AssignmentResponseBuilder id(Long id) { this.id = id; return this; }
        public AssignmentResponseBuilder classroomId(Long classroomId) { this.classroomId = classroomId; return this; }
        public AssignmentResponseBuilder title(String title) { this.title = title; return this; }
        public AssignmentResponseBuilder instructions(String instructions) { this.instructions = instructions; return this; }
        public AssignmentResponseBuilder attachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; return this; }
        public AssignmentResponseBuilder attachmentName(String attachmentName) { this.attachmentName = attachmentName; return this; }
        public AssignmentResponseBuilder dueDate(LocalDateTime dueDate) { this.dueDate = dueDate; return this; }
        public AssignmentResponseBuilder maxMarks(Integer maxMarks) { this.maxMarks = maxMarks; return this; }
        public AssignmentResponseBuilder allowLateSubmission(boolean allowLateSubmission) { this.allowLateSubmission = allowLateSubmission; return this; }
        public AssignmentResponseBuilder createdById(Long createdById) { this.createdById = createdById; return this; }
        public AssignmentResponseBuilder createdByName(String createdByName) { this.createdByName = createdByName; return this; }
        public AssignmentResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public AssignmentResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public AssignmentResponseBuilder submissionCount(long submissionCount) { this.submissionCount = submissionCount; return this; }
        public AssignmentResponseBuilder gradedCount(long gradedCount) { this.gradedCount = gradedCount; return this; }
        public AssignmentResponseBuilder mySubmission(SubmissionResponse mySubmission) { this.mySubmission = mySubmission; return this; }

        public AssignmentResponse build() {
            AssignmentResponse r = new AssignmentResponse();
            r.setId(id); r.setClassroomId(classroomId); r.setTitle(title);
            r.setInstructions(instructions); r.setAttachmentUrl(attachmentUrl);
            r.setAttachmentName(attachmentName); r.setDueDate(dueDate);
            r.setMaxMarks(maxMarks); r.setAllowLateSubmission(allowLateSubmission);
            r.setCreatedById(createdById); r.setCreatedByName(createdByName);
            r.setCreatedAt(createdAt); r.setUpdatedAt(updatedAt);
            r.setSubmissionCount(submissionCount); r.setGradedCount(gradedCount);
            r.setMySubmission(mySubmission);
            return r;
        }
    }
}
