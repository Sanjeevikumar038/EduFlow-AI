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
public class ResumeResponse {
    private Long id;
    private String fileName;
    private LocalDateTime uploadedDate;
    private Integer atsScore;
    private String atsBreakdown;
    private String summary;
    private String strengths;
    private String weaknesses;
    private String skillsFound;
    private String recommendedSkills;
    private String improvementSuggestions;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public LocalDateTime getUploadedDate() { return uploadedDate; }
    public void setUploadedDate(LocalDateTime uploadedDate) { this.uploadedDate = uploadedDate; }
    public Integer getAtsScore() { return atsScore; }
    public void setAtsScore(Integer atsScore) { this.atsScore = atsScore; }
    public String getAtsBreakdown() { return atsBreakdown; }
    public void setAtsBreakdown(String atsBreakdown) { this.atsBreakdown = atsBreakdown; }
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

    public static ResumeResponseBuilder builder() { return new ResumeResponseBuilder(); }
    public static class ResumeResponseBuilder {
        private Long id;
        private String fileName;
        private LocalDateTime uploadedDate;
        private Integer atsScore;
        private String atsBreakdown;
        private String summary;
        private String strengths;
        private String weaknesses;
        private String skillsFound;
        private String recommendedSkills;
        private String improvementSuggestions;

        public ResumeResponseBuilder id(Long id) { this.id = id; return this; }
        public ResumeResponseBuilder fileName(String fileName) { this.fileName = fileName; return this; }
        public ResumeResponseBuilder uploadedDate(LocalDateTime uploadedDate) { this.uploadedDate = uploadedDate; return this; }
        public ResumeResponseBuilder atsScore(Integer atsScore) { this.atsScore = atsScore; return this; }
        public ResumeResponseBuilder atsBreakdown(String atsBreakdown) { this.atsBreakdown = atsBreakdown; return this; }
        public ResumeResponseBuilder summary(String summary) { this.summary = summary; return this; }
        public ResumeResponseBuilder strengths(String strengths) { this.strengths = strengths; return this; }
        public ResumeResponseBuilder weaknesses(String weaknesses) { this.weaknesses = weaknesses; return this; }
        public ResumeResponseBuilder skillsFound(String skillsFound) { this.skillsFound = skillsFound; return this; }
        public ResumeResponseBuilder recommendedSkills(String recommendedSkills) { this.recommendedSkills = recommendedSkills; return this; }
        public ResumeResponseBuilder improvementSuggestions(String improvementSuggestions) { this.improvementSuggestions = improvementSuggestions; return this; }

        public ResumeResponse build() {
            ResumeResponse r = new ResumeResponse();
            r.setId(id); r.setFileName(fileName); r.setUploadedDate(uploadedDate);
            r.setAtsScore(atsScore); r.setAtsBreakdown(atsBreakdown);
            r.setSummary(summary); r.setStrengths(strengths); r.setWeaknesses(weaknesses);
            r.setSkillsFound(skillsFound); r.setRecommendedSkills(recommendedSkills);
            r.setImprovementSuggestions(improvementSuggestions);
            return r;
        }
    }
}
