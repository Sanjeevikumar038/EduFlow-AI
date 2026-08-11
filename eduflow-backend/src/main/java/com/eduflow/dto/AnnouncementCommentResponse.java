package com.eduflow.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementCommentResponse {
    private Long id;
    private Long announcementId;
    private Long authorId;
    private String authorName;
    private String authorRole;
    private String commentText;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAnnouncementId() { return announcementId; }
    public void setAnnouncementId(Long announcementId) { this.announcementId = announcementId; }
    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public String getAuthorRole() { return authorRole; }
    public void setAuthorRole(String authorRole) { this.authorRole = authorRole; }
    public String getCommentText() { return commentText; }
    public void setCommentText(String commentText) { this.commentText = commentText; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static AnnouncementCommentResponseBuilder builder() { return new AnnouncementCommentResponseBuilder(); }
    public static class AnnouncementCommentResponseBuilder {
        private Long id;
        private Long announcementId;
        private Long authorId;
        private String authorName;
        private String authorRole;
        private String commentText;
        private LocalDateTime createdAt;

        public AnnouncementCommentResponseBuilder id(Long id) { this.id = id; return this; }
        public AnnouncementCommentResponseBuilder announcementId(Long announcementId) { this.announcementId = announcementId; return this; }
        public AnnouncementCommentResponseBuilder authorId(Long authorId) { this.authorId = authorId; return this; }
        public AnnouncementCommentResponseBuilder authorName(String authorName) { this.authorName = authorName; return this; }
        public AnnouncementCommentResponseBuilder authorRole(String authorRole) { this.authorRole = authorRole; return this; }
        public AnnouncementCommentResponseBuilder commentText(String commentText) { this.commentText = commentText; return this; }
        public AnnouncementCommentResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public AnnouncementCommentResponse build() {
            AnnouncementCommentResponse r = new AnnouncementCommentResponse();
            r.setId(id); r.setAnnouncementId(announcementId); r.setAuthorId(authorId);
            r.setAuthorName(authorName); r.setAuthorRole(authorRole); r.setCommentText(commentText);
            r.setCreatedAt(createdAt);
            return r;
        }
    }
}
