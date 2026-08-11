package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "classrooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String roomCode;

    private String roomName;

    private Integer capacity;

    private String roomType;

    @Builder.Default
    private boolean active = true;

    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRoomCode() { return roomCode; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static ClassroomBuilder builder() { return new ClassroomBuilder(); }
    public static class ClassroomBuilder {
        private Long id;
        private String roomCode;
        private String roomName;
        private Integer capacity;
        private String roomType = "LECTURE";
        private LocalDateTime createdAt = LocalDateTime.now();
        private boolean active = true;

        public ClassroomBuilder id(Long id) { this.id = id; return this; }
        public ClassroomBuilder roomCode(String roomCode) { this.roomCode = roomCode; return this; }
        public ClassroomBuilder roomName(String roomName) { this.roomName = roomName; return this; }
        public ClassroomBuilder capacity(Integer capacity) { this.capacity = capacity; return this; }
        public ClassroomBuilder roomType(String roomType) { this.roomType = roomType; return this; }
        public ClassroomBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ClassroomBuilder active(boolean active) { this.active = active; return this; }

        public Classroom build() {
            Classroom c = new Classroom();
            c.setId(id); c.setRoomCode(roomCode); c.setRoomName(roomName); c.setCapacity(capacity);
            if (roomType != null) c.setRoomType(roomType);
            if (createdAt != null) c.setCreatedAt(createdAt);
            c.setActive(active);
            return c;
        }
    }
}
