package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "classroom_materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassroomMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id", nullable = false)
    private CourseClassroom classroom;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "uploaded_by_id", nullable = false)
    private User uploadedBy;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // e.g., "PDF", "PPT", "DOCX", "VIDEO", "LAB_MANUAL", "REFERENCE_LINK"
    @Column(nullable = false)
    private String materialType;

    // Topic / Folder categorization e.g., "Unit 1: Basics", "Lab Manuals"
    private String topic;

    @Column(columnDefinition = "LONGTEXT")
    private String fileUrl;

    private String fileName;

    private String fileSize;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CourseClassroom getClassroom() { return classroom; }
    public void setClassroom(CourseClassroom classroom) { this.classroom = classroom; }
    public User getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; }
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

    public static ClassroomMaterialBuilder builder() { return new ClassroomMaterialBuilder(); }
    public static class ClassroomMaterialBuilder {
        private Long id;
        private CourseClassroom classroom;
        private User uploadedBy;
        private String title;
        private String description;
        private String materialType;
        private String topic;
        private String fileUrl;
        private String fileName;
        private String fileSize;
        private LocalDateTime createdAt = LocalDateTime.now();

        public ClassroomMaterialBuilder id(Long id) { this.id = id; return this; }
        public ClassroomMaterialBuilder classroom(CourseClassroom classroom) { this.classroom = classroom; return this; }
        public ClassroomMaterialBuilder uploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; return this; }
        public ClassroomMaterialBuilder title(String title) { this.title = title; return this; }
        public ClassroomMaterialBuilder description(String description) { this.description = description; return this; }
        public ClassroomMaterialBuilder materialType(String materialType) { this.materialType = materialType; return this; }
        public ClassroomMaterialBuilder topic(String topic) { this.topic = topic; return this; }
        public ClassroomMaterialBuilder fileUrl(String fileUrl) { this.fileUrl = fileUrl; return this; }
        public ClassroomMaterialBuilder fileName(String fileName) { this.fileName = fileName; return this; }
        public ClassroomMaterialBuilder fileSize(String fileSize) { this.fileSize = fileSize; return this; }
        public ClassroomMaterialBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public ClassroomMaterial build() {
            ClassroomMaterial m = new ClassroomMaterial();
            m.setId(id); m.setClassroom(classroom); m.setUploadedBy(uploadedBy);
            m.setTitle(title); m.setDescription(description); m.setMaterialType(materialType);
            m.setTopic(topic); m.setFileUrl(fileUrl); m.setFileName(fileName); m.setFileSize(fileSize);
            if (createdAt != null) m.setCreatedAt(createdAt);
            return m;
        }
    }
}
