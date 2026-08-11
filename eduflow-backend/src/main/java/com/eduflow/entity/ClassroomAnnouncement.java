package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "classroom_announcements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassroomAnnouncement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id", nullable = false)
    private CourseClassroom classroom;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Builder.Default
    private boolean isPinned = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CourseClassroom getClassroom() { return classroom; }
    public void setClassroom(CourseClassroom classroom) { this.classroom = classroom; }
    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }
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

    public static ClassroomAnnouncementBuilder builder() { return new ClassroomAnnouncementBuilder(); }
    public static class ClassroomAnnouncementBuilder {
        private Long id;
        private CourseClassroom classroom;
        private User author;
        private String title;
        private String content;
        private boolean isPinned = false;
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime updatedAt;

        public ClassroomAnnouncementBuilder id(Long id) { this.id = id; return this; }
        public ClassroomAnnouncementBuilder classroom(CourseClassroom classroom) { this.classroom = classroom; return this; }
        public ClassroomAnnouncementBuilder author(User author) { this.author = author; return this; }
        public ClassroomAnnouncementBuilder title(String title) { this.title = title; return this; }
        public ClassroomAnnouncementBuilder content(String content) { this.content = content; return this; }
        public ClassroomAnnouncementBuilder isPinned(boolean isPinned) { this.isPinned = isPinned; return this; }
        public ClassroomAnnouncementBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ClassroomAnnouncementBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public ClassroomAnnouncement build() {
            ClassroomAnnouncement a = new ClassroomAnnouncement();
            a.setId(id); a.setClassroom(classroom); a.setAuthor(author);
            a.setTitle(title); a.setContent(content); a.setPinned(isPinned);
            if (createdAt != null) a.setCreatedAt(createdAt);
            a.setUpdatedAt(updatedAt);
            return a;
        }
    }
}
