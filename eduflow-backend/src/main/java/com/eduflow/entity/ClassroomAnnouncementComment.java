package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "classroom_announcement_comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassroomAnnouncementComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "announcement_id", nullable = false)
    private ClassroomAnnouncement announcement;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String commentText;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ClassroomAnnouncement getAnnouncement() { return announcement; }
    public void setAnnouncement(ClassroomAnnouncement announcement) { this.announcement = announcement; }
    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }
    public String getCommentText() { return commentText; }
    public void setCommentText(String commentText) { this.commentText = commentText; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static ClassroomAnnouncementCommentBuilder builder() { return new ClassroomAnnouncementCommentBuilder(); }
    public static class ClassroomAnnouncementCommentBuilder {
        private Long id;
        private ClassroomAnnouncement announcement;
        private User author;
        private String commentText;
        private LocalDateTime createdAt = LocalDateTime.now();

        public ClassroomAnnouncementCommentBuilder id(Long id) { this.id = id; return this; }
        public ClassroomAnnouncementCommentBuilder announcement(ClassroomAnnouncement announcement) { this.announcement = announcement; return this; }
        public ClassroomAnnouncementCommentBuilder author(User author) { this.author = author; return this; }
        public ClassroomAnnouncementCommentBuilder commentText(String commentText) { this.commentText = commentText; return this; }
        public ClassroomAnnouncementCommentBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public ClassroomAnnouncementComment build() {
            ClassroomAnnouncementComment c = new ClassroomAnnouncementComment();
            c.setId(id); c.setAnnouncement(announcement); c.setAuthor(author);
            c.setCommentText(commentText);
            if (createdAt != null) c.setCreatedAt(createdAt);
            return c;
        }
    }
}
