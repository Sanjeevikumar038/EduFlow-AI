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
public class CareerHistoryDto {
    private Long id;
    private Integer careerScore;
    private LocalDateTime careerScoreDate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getCareerScore() { return careerScore; }
    public void setCareerScore(Integer careerScore) { this.careerScore = careerScore; }
    public LocalDateTime getCareerScoreDate() { return careerScoreDate; }
    public void setCareerScoreDate(LocalDateTime careerScoreDate) { this.careerScoreDate = careerScoreDate; }

    public static CareerHistoryDtoBuilder builder() { return new CareerHistoryDtoBuilder(); }
    public static class CareerHistoryDtoBuilder {
        private Long id;
        private Integer careerScore;
        private LocalDateTime careerScoreDate;

        public CareerHistoryDtoBuilder id(Long id) { this.id = id; return this; }
        public CareerHistoryDtoBuilder careerScore(Integer careerScore) { this.careerScore = careerScore; return this; }
        public CareerHistoryDtoBuilder careerScoreDate(LocalDateTime careerScoreDate) { this.careerScoreDate = careerScoreDate; return this; }

        public CareerHistoryDto build() {
            CareerHistoryDto dto = new CareerHistoryDto();
            dto.setId(id); dto.setCareerScore(careerScore); dto.setCareerScoreDate(careerScoreDate);
            return dto;
        }
    }
}
