package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "classroom_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassroomAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id", nullable = false)
    private CourseClassroom classroom;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(columnDefinition = "TEXT")
    private String attachmentUrl;

    private String attachmentName;

    private LocalDateTime dueDate;

    @Builder.Default
    private Integer maxMarks = 100;

    @Builder.Default
    private boolean allowLateSubmission = true;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CourseClassroom getClassroom() { return classroom; }
    public void setClassroom(CourseClassroom classroom) { this.classroom = classroom; }
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
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static ClassroomAssignmentBuilder builder() { return new ClassroomAssignmentBuilder(); }
    public static class ClassroomAssignmentBuilder {
        private Long id;
        private CourseClassroom classroom;
        private String title;
        private String instructions;
        private String attachmentUrl;
        private String attachmentName;
        private LocalDateTime dueDate;
        private Integer maxMarks = 100;
        private boolean allowLateSubmission = true;
        private User createdBy;
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime updatedAt;

        public ClassroomAssignmentBuilder id(Long id) { this.id = id; return this; }
        public ClassroomAssignmentBuilder classroom(CourseClassroom classroom) { this.classroom = classroom; return this; }
        public ClassroomAssignmentBuilder title(String title) { this.title = title; return this; }
        public ClassroomAssignmentBuilder instructions(String instructions) { this.instructions = instructions; return this; }
        public ClassroomAssignmentBuilder attachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; return this; }
        public ClassroomAssignmentBuilder attachmentName(String attachmentName) { this.attachmentName = attachmentName; return this; }
        public ClassroomAssignmentBuilder dueDate(LocalDateTime dueDate) { this.dueDate = dueDate; return this; }
        public ClassroomAssignmentBuilder maxMarks(Integer maxMarks) { this.maxMarks = maxMarks; return this; }
        public ClassroomAssignmentBuilder allowLateSubmission(boolean allowLateSubmission) { this.allowLateSubmission = allowLateSubmission; return this; }
        public ClassroomAssignmentBuilder createdBy(User createdBy) { this.createdBy = createdBy; return this; }
        public ClassroomAssignmentBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ClassroomAssignmentBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public ClassroomAssignment build() {
            ClassroomAssignment a = new ClassroomAssignment();
            a.setId(id); a.setClassroom(classroom); a.setTitle(title);
            a.setInstructions(instructions); a.setAttachmentUrl(attachmentUrl);
            a.setAttachmentName(attachmentName); a.setDueDate(dueDate);
            if (maxMarks != null) a.setMaxMarks(maxMarks);
            a.setAllowLateSubmission(allowLateSubmission); a.setCreatedBy(createdBy);
            if (createdAt != null) a.setCreatedAt(createdAt);
            a.setUpdatedAt(updatedAt);
            return a;
        }
    }
}
