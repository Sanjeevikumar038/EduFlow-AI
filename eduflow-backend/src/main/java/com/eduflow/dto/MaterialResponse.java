package com.eduflow.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialResponse {
    private Long id;
    private Long classroomId;
    private Long uploadedById;
    private String uploadedByName;
    private String uploadedByRole;
    private String title;
    private String description;
    private String materialType;
    private String topic;
    private String fileUrl;
    private String fileName;
    private String fileSize;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getClassroomId() { return classroomId; }
    public void setClassroomId(Long classroomId) { this.classroomId = classroomId; }
    public Long getUploadedById() { return uploadedById; }
    public void setUploadedById(Long uploadedById) { this.uploadedById = uploadedById; }
    public String getUploadedByName() { return uploadedByName; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }
    public String getUploadedByRole() { return uploadedByRole; }
    public void setUploadedByRole(String uploadedByRole) { this.uploadedByRole = uploadedByRole; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getMaterialType() { return materialType; }
    public void setMaterialType(String materialType) { this.materialType = materialType; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileSize() { return fileSize; }
    public void setFileSize(String fileSize) { this.fileSize = fileSize; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static MaterialResponseBuilder builder() { return new MaterialResponseBuilder(); }
    public static class MaterialResponseBuilder {
        private Long id;
        private Long classroomId;
        private Long uploadedById;
        private String uploadedByName;
        private String uploadedByRole;
        private String title;
        private String description;
        private String materialType;
        private String topic;
        private String fileUrl;
        private String fileName;
        private String fileSize;
        private LocalDateTime createdAt;

        public MaterialResponseBuilder id(Long id) { this.id = id; return this; }
        public MaterialResponseBuilder classroomId(Long classroomId) { this.classroomId = classroomId; return this; }
        public MaterialResponseBuilder uploadedById(Long uploadedById) { this.uploadedById = uploadedById; return this; }
        public MaterialResponseBuilder uploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; return this; }
        public MaterialResponseBuilder uploadedByRole(String uploadedByRole) { this.uploadedByRole = uploadedByRole; return this; }
        public MaterialResponseBuilder title(String title) { this.title = title; return this; }
        public MaterialResponseBuilder description(String description) { this.description = description; return this; }
        public MaterialResponseBuilder materialType(String materialType) { this.materialType = materialType; return this; }
        public MaterialResponseBuilder topic(String topic) { this.topic = topic; return this; }
        public MaterialResponseBuilder fileUrl(String fileUrl) { this.fileUrl = fileUrl; return this; }
        public MaterialResponseBuilder fileName(String fileName) { this.fileName = fileName; return this; }
        public MaterialResponseBuilder fileSize(String fileSize) { this.fileSize = fileSize; return this; }
        public MaterialResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public MaterialResponse build() {
            MaterialResponse r = new MaterialResponse();
            r.setId(id); r.setClassroomId(classroomId); r.setUploadedById(uploadedById);
            r.setUploadedByName(uploadedByName); r.setUploadedByRole(uploadedByRole);
            r.setTitle(title); r.setDescription(description); r.setMaterialType(materialType);
            r.setTopic(topic); r.setFileUrl(fileUrl); r.setFileName(fileName);
            r.setFileSize(fileSize); r.setCreatedAt(createdAt);
            return r;
        }
    }
}
