package com.eduflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewDomainDto {
    private Long id;
    private String name;
    private String description;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public static InterviewDomainDtoBuilder builder() { return new InterviewDomainDtoBuilder(); }
    public static class InterviewDomainDtoBuilder {
        private Long id;
        private String name;
        private String description;

        public InterviewDomainDtoBuilder id(Long id) { this.id = id; return this; }
        public InterviewDomainDtoBuilder name(String name) { this.name = name; return this; }
        public InterviewDomainDtoBuilder description(String description) { this.description = description; return this; }

        public InterviewDomainDto build() {
            InterviewDomainDto dto = new InterviewDomainDto();
            dto.setId(id); dto.setName(name); dto.setDescription(description);
            return dto;
        }
    }
}
