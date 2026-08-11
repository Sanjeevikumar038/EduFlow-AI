package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    private String fileName;
    
    private String filePath;

    private LocalDateTime uploadedDate;

    @Column(columnDefinition = "TEXT")
    private String extractedText;

    private Integer atsScore;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String weaknesses;

    @Column(columnDefinition = "TEXT")
    private String skillsFound;

    @Column(columnDefinition = "TEXT")
    private String recommendedSkills;

    @Column(columnDefinition = "TEXT")
    private String improvementSuggestions;

    @Column(columnDefinition = "TEXT")
    private String atsBreakdown; // JSON

    @Column(columnDefinition = "TEXT")
    private String aiResponse;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public LocalDateTime getUploadedDate() { return uploadedDate; }
    public void setUploadedDate(LocalDateTime uploadedDate) { this.uploadedDate = uploadedDate; }
    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }
    public Integer getAtsScore() { return atsScore; }
    public void setAtsScore(Integer atsScore) { this.atsScore = atsScore; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getStrengths() { return strengths; }
    public void setStrengths(String strengths) { this.strengths = strengths; }
    public String getWeaknesses() { return weaknesses; }
    public void setWeaknesses(String weaknesses) { this.weaknesses = weaknesses; }
    public String getSkillsFound() { return skillsFound; }
    public void setSkillsFound(String skillsFound) { this.skillsFound = skillsFound; }
    public String getRecommendedSkills() { return recommendedSkills; }
    public void setRecommendedSkills(String recommendedSkills) { this.recommendedSkills = recommendedSkills; }
    public String getImprovementSuggestions() { return improvementSuggestions; }
    public void setImprovementSuggestions(String improvementSuggestions) { this.improvementSuggestions = improvementSuggestions; }
    public String getAtsBreakdown() { return atsBreakdown; }
    public void setAtsBreakdown(String atsBreakdown) { this.atsBreakdown = atsBreakdown; }
    public String getAiResponse() { return aiResponse; }
    public void setAiResponse(String aiResponse) { this.aiResponse = aiResponse; }

    public static ResumeBuilder builder() { return new ResumeBuilder(); }
    public static class ResumeBuilder {
        private Long id;
        private User student;
        private String fileName;
        private String filePath;
        private LocalDateTime uploadedDate;
        private String extractedText;
        private Integer atsScore;
        private String summary;
        private String strengths;
        private String weaknesses;
        private String skillsFound;
        private String recommendedSkills;
        private String improvementSuggestions;
        private String atsBreakdown;
        private String aiResponse;

        public ResumeBuilder id(Long id) { this.id = id; return this; }
        public ResumeBuilder student(User student) { this.student = student; return this; }
        public ResumeBuilder fileName(String fileName) { this.fileName = fileName; return this; }
        public ResumeBuilder filePath(String filePath) { this.filePath = filePath; return this; }
        public ResumeBuilder uploadedDate(LocalDateTime uploadedDate) { this.uploadedDate = uploadedDate; return this; }
        public ResumeBuilder extractedText(String extractedText) { this.extractedText = extractedText; return this; }
        public ResumeBuilder atsScore(Integer atsScore) { this.atsScore = atsScore; return this; }
        public ResumeBuilder summary(String summary) { this.summary = summary; return this; }
        public ResumeBuilder strengths(String strengths) { this.strengths = strengths; return this; }
        public ResumeBuilder weaknesses(String weaknesses) { this.weaknesses = weaknesses; return this; }
        public ResumeBuilder skillsFound(String skillsFound) { this.skillsFound = skillsFound; return this; }
        public ResumeBuilder recommendedSkills(String recommendedSkills) { this.recommendedSkills = recommendedSkills; return this; }
        public ResumeBuilder improvementSuggestions(String improvementSuggestions) { this.improvementSuggestions = improvementSuggestions; return this; }
        public ResumeBuilder atsBreakdown(String atsBreakdown) { this.atsBreakdown = atsBreakdown; return this; }
        public ResumeBuilder aiResponse(String aiResponse) { this.aiResponse = aiResponse; return this; }

        public Resume build() {
            Resume r = new Resume();
            r.setId(id); r.setStudent(student); r.setFileName(fileName);
            r.setFilePath(filePath); r.setUploadedDate(uploadedDate);
            r.setExtractedText(extractedText); r.setAtsScore(atsScore);
            r.setSummary(summary); r.setStrengths(strengths); r.setWeaknesses(weaknesses);
            r.setSkillsFound(skillsFound); r.setRecommendedSkills(recommendedSkills);
            r.setImprovementSuggestions(improvementSuggestions); r.setAtsBreakdown(atsBreakdown);
            r.setAiResponse(aiResponse);
            return r;
        }
    }
}
