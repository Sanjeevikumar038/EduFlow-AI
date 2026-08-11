package com.eduflow.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementResponse {
    private Long id;
    private Long classroomId;
    private Long authorId;
    private String authorName;
    private String authorRole;
    private String title;
    private String content;
    private boolean isPinned;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AnnouncementCommentResponse> comments;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getClassroomId() { return classroomId; }
    public void setClassroomId(Long classroomId) { this.classroomId = classroomId; }
    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public String getAuthorRole() { return authorRole; }
    public void setAuthorRole(String authorRole) { this.authorRole = authorRole; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public boolean isPinned() { return isPinned; }
    public void setPinned(boolean isPinned) { this.isPinned = isPinned; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<AnnouncementCommentResponse> getComments() { return comments; }
    public void setComments(List<AnnouncementCommentResponse> comments) { this.comments = comments; }

    public static AnnouncementResponseBuilder builder() { return new AnnouncementResponseBuilder(); }
    public static class AnnouncementResponseBuilder {
        private Long id;
        private Long classroomId;
        private Long authorId;
        private String authorName;
        private String authorRole;
        private String title;
        private String content;
        private boolean isPinned;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<AnnouncementCommentResponse> comments;

        public AnnouncementResponseBuilder id(Long id) { this.id = id; return this; }
        public AnnouncementResponseBuilder classroomId(Long classroomId) { this.classroomId = classroomId; return this; }
        public AnnouncementResponseBuilder authorId(Long authorId) { this.authorId = authorId; return this; }
        public AnnouncementResponseBuilder authorName(String authorName) { this.authorName = authorName; return this; }
        public AnnouncementResponseBuilder authorRole(String authorRole) { this.authorRole = authorRole; return this; }
        public AnnouncementResponseBuilder title(String title) { this.title = title; return this; }
        public AnnouncementResponseBuilder content(String content) { this.content = content; return this; }
        public AnnouncementResponseBuilder isPinned(boolean isPinned) { this.isPinned = isPinned; return this; }
        public AnnouncementResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public AnnouncementResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public AnnouncementResponseBuilder comments(List<AnnouncementCommentResponse> comments) { this.comments = comments; return this; }

        public AnnouncementResponse build() {
            AnnouncementResponse r = new AnnouncementResponse();
            r.setId(id); r.setClassroomId(classroomId); r.setAuthorId(authorId);
            r.setAuthorName(authorName); r.setAuthorRole(authorRole); r.setTitle(title);
            r.setContent(content); r.setPinned(isPinned); r.setCreatedAt(createdAt);
            r.setUpdatedAt(updatedAt); r.setComments(comments);
            return r;
        }
    }
}
