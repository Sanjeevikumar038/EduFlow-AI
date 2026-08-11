package com.eduflow.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentResponse {
    private Long id;
    private Long classroomId;
    private String title;
    private String description;
    private String assessmentType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private Integer totalMarks;
    private Integer passMarks;
    private boolean shuffleQuestions;
    private boolean shuffleOptions;
    private boolean autoPublishResult;
    private Double negativeMarking;
    private String status;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private long totalQuestions;
    private long attemptCount;
    private List<AssessmentQuestionDTO> questions;
    private AssessmentAttemptResponse myAttempt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getClassroomId() { return classroomId; }
    public void setClassroomId(Long classroomId) { this.classroomId = classroomId; }
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
    public Long getCreatedById() { return createdById; }
    public void setCreatedById(Long createdById) { this.createdById = createdById; }
    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public long getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(long totalQuestions) { this.totalQuestions = totalQuestions; }
    public long getAttemptCount() { return attemptCount; }
    public void setAttemptCount(long attemptCount) { this.attemptCount = attemptCount; }
    public List<AssessmentQuestionDTO> getQuestions() { return questions; }
    public void setQuestions(List<AssessmentQuestionDTO> questions) { this.questions = questions; }
    public AssessmentAttemptResponse getMyAttempt() { return myAttempt; }
    public void setMyAttempt(AssessmentAttemptResponse myAttempt) { this.myAttempt = myAttempt; }

    public static AssessmentResponseBuilder builder() { return new AssessmentResponseBuilder(); }
    public static class AssessmentResponseBuilder {
        private Long id;
        private Long classroomId;
        private String title;
        private String description;
        private String assessmentType;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Integer durationMinutes;
        private Integer totalMarks;
        private Integer passMarks;
        private boolean shuffleQuestions;
        private boolean shuffleOptions;
        private boolean autoPublishResult;
        private Double negativeMarking;
        private String status;
        private Long createdById;
        private String createdByName;
        private LocalDateTime createdAt;
        private long totalQuestions;
        private long attemptCount;
        private List<AssessmentQuestionDTO> questions;
        private AssessmentAttemptResponse myAttempt;

        public AssessmentResponseBuilder id(Long id) { this.id = id; return this; }
        public AssessmentResponseBuilder classroomId(Long classroomId) { this.classroomId = classroomId; return this; }
        public AssessmentResponseBuilder title(String title) { this.title = title; return this; }
        public AssessmentResponseBuilder description(String description) { this.description = description; return this; }
        public AssessmentResponseBuilder assessmentType(String assessmentType) { this.assessmentType = assessmentType; return this; }
        public AssessmentResponseBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public AssessmentResponseBuilder endTime(LocalDateTime endTime) { this.endTime = endTime; return this; }
        public AssessmentResponseBuilder durationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; return this; }
        public AssessmentResponseBuilder totalMarks(Integer totalMarks) { this.totalMarks = totalMarks; return this; }
        public AssessmentResponseBuilder passMarks(Integer passMarks) { this.passMarks = passMarks; return this; }
        public AssessmentResponseBuilder shuffleQuestions(boolean shuffleQuestions) { this.shuffleQuestions = shuffleQuestions; return this; }
        public AssessmentResponseBuilder shuffleOptions(boolean shuffleOptions) { this.shuffleOptions = shuffleOptions; return this; }
        public AssessmentResponseBuilder autoPublishResult(boolean autoPublishResult) { this.autoPublishResult = autoPublishResult; return this; }
        public AssessmentResponseBuilder negativeMarking(Double negativeMarking) { this.negativeMarking = negativeMarking; return this; }
        public AssessmentResponseBuilder status(String status) { this.status = status; return this; }
        public AssessmentResponseBuilder createdById(Long createdById) { this.createdById = createdById; return this; }
        public AssessmentResponseBuilder createdByName(String createdByName) { this.createdByName = createdByName; return this; }
        public AssessmentResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public AssessmentResponseBuilder totalQuestions(long totalQuestions) { this.totalQuestions = totalQuestions; return this; }
        public AssessmentResponseBuilder attemptCount(long attemptCount) { this.attemptCount = attemptCount; return this; }
        public AssessmentResponseBuilder questions(List<AssessmentQuestionDTO> questions) { this.questions = questions; return this; }
        public AssessmentResponseBuilder myAttempt(AssessmentAttemptResponse myAttempt) { this.myAttempt = myAttempt; return this; }

        public AssessmentResponse build() {
            AssessmentResponse r = new AssessmentResponse();
            r.setId(id); r.setClassroomId(classroomId); r.setTitle(title);
            r.setDescription(description); r.setAssessmentType(assessmentType);
            r.setStartTime(startTime); r.setEndTime(endTime);
            r.setDurationMinutes(durationMinutes); r.setTotalMarks(totalMarks);
            r.setPassMarks(passMarks); r.setShuffleQuestions(shuffleQuestions);
            r.setShuffleOptions(shuffleOptions); r.setAutoPublishResult(autoPublishResult);
            r.setNegativeMarking(negativeMarking); r.setStatus(status);
            r.setCreatedById(createdById); r.setCreatedByName(createdByName);
            r.setCreatedAt(createdAt); r.setTotalQuestions(totalQuestions);
            r.setAttemptCount(attemptCount); r.setQuestions(questions);
            r.setMyAttempt(myAttempt);
            return r;
        }
    }
}
