package com.eduflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private String message;
    private boolean isRead;
    private LocalDateTime timestamp;
    private String type;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean isRead) { this.isRead = isRead; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public static NotificationDtoBuilder builder() { return new NotificationDtoBuilder(); }
    public static class NotificationDtoBuilder {
        private Long id;
        private String message;
        private boolean isRead;
        private LocalDateTime timestamp;
        private String type;

        public NotificationDtoBuilder id(Long id) { this.id = id; return this; }
        public NotificationDtoBuilder message(String message) { this.message = message; return this; }
        public NotificationDtoBuilder isRead(boolean isRead) { this.isRead = isRead; return this; }
        public NotificationDtoBuilder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }
        public NotificationDtoBuilder type(String type) { this.type = type; return this; }

        public NotificationDto build() {
            NotificationDto dto = new NotificationDto();
            dto.setId(id); dto.setMessage(message); dto.setRead(isRead);
            dto.setTimestamp(timestamp); dto.setType(type);
            return dto;
        }
    }
}
