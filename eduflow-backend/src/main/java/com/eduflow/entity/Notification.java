package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String message;

    private boolean isRead;

    private LocalDateTime timestamp;

    private String type; // e.g., "RESUME", "INTERVIEW", "ATTENDANCE", "LEAVE", "TIMETABLE"

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean isRead) { this.isRead = isRead; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public static NotificationBuilder builder() { return new NotificationBuilder(); }
    public static class NotificationBuilder {
        private Long id;
        private User user;
        private String message;
        private boolean isRead = false;
        private LocalDateTime timestamp = LocalDateTime.now();
        private String type;

        public NotificationBuilder id(Long id) { this.id = id; return this; }
        public NotificationBuilder user(User user) { this.user = user; return this; }
        public NotificationBuilder message(String message) { this.message = message; return this; }
        public NotificationBuilder isRead(boolean isRead) { this.isRead = isRead; return this; }
        public NotificationBuilder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }
        public NotificationBuilder type(String type) { this.type = type; return this; }

        public Notification build() {
            Notification n = new Notification();
            n.setId(id); n.setUser(user); n.setMessage(message);
            n.setRead(isRead); n.setTimestamp(timestamp); n.setType(type);
            return n;
        }
    }
}
