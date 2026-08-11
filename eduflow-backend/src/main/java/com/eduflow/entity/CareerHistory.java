package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "career_histories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareerHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    private Integer careerScore;

    private LocalDateTime careerScoreDate = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public Integer getCareerScore() { return careerScore; }
    public void setCareerScore(Integer careerScore) { this.careerScore = careerScore; }
    public LocalDateTime getCareerScoreDate() { return careerScoreDate; }
    public void setCareerScoreDate(LocalDateTime careerScoreDate) { this.careerScoreDate = careerScoreDate; }

    public static CareerHistoryBuilder builder() { return new CareerHistoryBuilder(); }
    public static class CareerHistoryBuilder {
        private Long id;
        private User student;
        private Integer careerScore;
        private LocalDateTime careerScoreDate = LocalDateTime.now();

        public CareerHistoryBuilder id(Long id) { this.id = id; return this; }
        public CareerHistoryBuilder student(User student) { this.student = student; return this; }
        public CareerHistoryBuilder careerScore(Integer careerScore) { this.careerScore = careerScore; return this; }
        public CareerHistoryBuilder careerScoreDate(LocalDateTime careerScoreDate) { this.careerScoreDate = careerScoreDate; return this; }

        public CareerHistory build() {
            CareerHistory c = new CareerHistory();
            c.setId(id); c.setStudent(student); c.setCareerScore(careerScore);
            if (careerScoreDate != null) c.setCareerScoreDate(careerScoreDate);
            return c;
        }
    }
}
