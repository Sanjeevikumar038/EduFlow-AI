package com.eduflow.dto;

import java.time.LocalDateTime;

public class JobDescriptionDto {
    private Long id;
    private String title;
    private String companyName;
    private String descriptionText;
    private LocalDateTime postedDate;

    public JobDescriptionDto() {}

    public JobDescriptionDto(Long id, String title, String companyName, String descriptionText, LocalDateTime postedDate) {
        this.id = id;
        this.title = title;
        this.companyName = companyName;
        this.descriptionText = descriptionText;
        this.postedDate = postedDate;
    }

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

    public static JobDescriptionDtoBuilder builder() { return new JobDescriptionDtoBuilder(); }
    public static class JobDescriptionDtoBuilder {
        private Long id;
        private String title;
        private String companyName;
        private String descriptionText;
        private LocalDateTime postedDate;

        public JobDescriptionDtoBuilder id(Long id) { this.id = id; return this; }
        public JobDescriptionDtoBuilder title(String title) { this.title = title; return this; }
        public JobDescriptionDtoBuilder companyName(String companyName) { this.companyName = companyName; return this; }
        public JobDescriptionDtoBuilder descriptionText(String descriptionText) { this.descriptionText = descriptionText; return this; }
        public JobDescriptionDtoBuilder postedDate(LocalDateTime postedDate) { this.postedDate = postedDate; return this; }

        public JobDescriptionDto build() {
            JobDescriptionDto dto = new JobDescriptionDto();
            dto.setId(id); dto.setTitle(title); dto.setCompanyName(companyName);
            dto.setDescriptionText(descriptionText); dto.setPostedDate(postedDate);
            return dto;
        }
    }
}
