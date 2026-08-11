package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_domains")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewDomain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public static InterviewDomainBuilder builder() { return new InterviewDomainBuilder(); }
    public static class InterviewDomainBuilder {
        private Long id;
        private String name;
        private String description;
        private Boolean isActive = true;

        public InterviewDomainBuilder id(Long id) { this.id = id; return this; }
        public InterviewDomainBuilder name(String name) { this.name = name; return this; }
        public InterviewDomainBuilder description(String description) { this.description = description; return this; }
        public InterviewDomainBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }

        public InterviewDomain build() {
            InterviewDomain d = new InterviewDomain();
            d.setId(id); d.setName(name); d.setDescription(description);
            if (isActive != null) d.setIsActive(isActive);
            return d;
        }
    }
}
