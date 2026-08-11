package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private String fatherName;
    private String fatherPhone;
    
    private String motherName;
    private String motherPhone;

    private String guardianName;
    private String guardianPhone;
    private String guardianEmail;

    private String bloodGroup;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getFatherName() { return fatherName; }
    public void setFatherName(String fatherName) { this.fatherName = fatherName; }
    public String getFatherPhone() { return fatherPhone; }
    public void setFatherPhone(String fatherPhone) { this.fatherPhone = fatherPhone; }
    public String getMotherName() { return motherName; }
    public void setMotherName(String motherName) { this.motherName = motherName; }
    public String getMotherPhone() { return motherPhone; }
    public void setMotherPhone(String motherPhone) { this.motherPhone = motherPhone; }
    public String getGuardianName() { return guardianName; }
    public void setGuardianName(String guardianName) { this.guardianName = guardianName; }
    public String getGuardianPhone() { return guardianPhone; }
    public void setGuardianPhone(String guardianPhone) { this.guardianPhone = guardianPhone; }
    public String getGuardianEmail() { return guardianEmail; }
    public void setGuardianEmail(String guardianEmail) { this.guardianEmail = guardianEmail; }
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static StudentProfileBuilder builder() { return new StudentProfileBuilder(); }
    public static class StudentProfileBuilder {
        private Long id;
        private User user;
        private String fatherName;
        private String fatherPhone;
        private String motherName;
        private String motherPhone;
        private String guardianName;
        private String guardianPhone;
        private String guardianEmail;
        private String bloodGroup;
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime updatedAt = LocalDateTime.now();

        public StudentProfileBuilder id(Long id) { this.id = id; return this; }
        public StudentProfileBuilder user(User user) { this.user = user; return this; }
        public StudentProfileBuilder fatherName(String fatherName) { this.fatherName = fatherName; return this; }
        public StudentProfileBuilder fatherPhone(String fatherPhone) { this.fatherPhone = fatherPhone; return this; }
        public StudentProfileBuilder motherName(String motherName) { this.motherName = motherName; return this; }
        public StudentProfileBuilder motherPhone(String motherPhone) { this.motherPhone = motherPhone; return this; }
        public StudentProfileBuilder guardianName(String guardianName) { this.guardianName = guardianName; return this; }
        public StudentProfileBuilder guardianPhone(String guardianPhone) { this.guardianPhone = guardianPhone; return this; }
        public StudentProfileBuilder guardianEmail(String guardianEmail) { this.guardianEmail = guardianEmail; return this; }
        public StudentProfileBuilder bloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; return this; }
        public StudentProfileBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public StudentProfileBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public StudentProfile build() {
            StudentProfile p = new StudentProfile();
            p.setId(id); p.setUser(user); p.setFatherName(fatherName); p.setFatherPhone(fatherPhone);
            p.setMotherName(motherName); p.setMotherPhone(motherPhone); p.setGuardianName(guardianName);
            p.setGuardianPhone(guardianPhone); p.setGuardianEmail(guardianEmail); p.setBloodGroup(bloodGroup);
            if (createdAt != null) p.setCreatedAt(createdAt);
            if (updatedAt != null) p.setUpdatedAt(updatedAt);
            return p;
        }
    }
}
