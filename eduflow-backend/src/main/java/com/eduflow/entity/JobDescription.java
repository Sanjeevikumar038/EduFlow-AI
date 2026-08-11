package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_descriptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String companyName;
    
    @Column(columnDefinition = "TEXT")
    private String descriptionText;
    
    private LocalDateTime postedDate = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getDescriptionText() { return descriptionText; }
    public void setDescriptionText(String descriptionText) { this.descriptionText = descriptionText; }
    public LocalDateTime getPostedDate() { return postedDate; }
    public void setPostedDate(LocalDateTime postedDate) { this.postedDate = postedDate; }

    public static JobDescriptionBuilder builder() { return new JobDescriptionBuilder(); }
    public static class JobDescriptionBuilder {
        private Long id;
        private String title;
        private String companyName;
        private String descriptionText;
        private LocalDateTime postedDate = LocalDateTime.now();

        public JobDescriptionBuilder id(Long id) { this.id = id; return this; }
        public JobDescriptionBuilder title(String title) { this.title = title; return this; }
        public JobDescriptionBuilder companyName(String companyName) { this.companyName = companyName; return this; }
        public JobDescriptionBuilder descriptionText(String descriptionText) { this.descriptionText = descriptionText; return this; }
        public JobDescriptionBuilder postedDate(LocalDateTime postedDate) { this.postedDate = postedDate; return this; }

        public JobDescription build() {
            JobDescription j = new JobDescription();
            j.setId(id); j.setTitle(title); j.setCompanyName(companyName);
            j.setDescriptionText(descriptionText);
            if (postedDate != null) j.setPostedDate(postedDate);
            return j;
        }
    }
}
