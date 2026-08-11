package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_ai_insights")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAIInsight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    private Long classroomId;

    @Column(columnDefinition = "TEXT")
    private String weakTopicsJson; // e.g. ["Graph Dijkstra", "Dynamic Programming"]

    @Column(columnDefinition = "TEXT")
    private String strengthAreasJson;

    @Column(columnDefinition = "TEXT")
    private String learningRecommendations;

    @Column(columnDefinition = "TEXT")
    private String suggestedActionItems;

    @Builder.Default
    private LocalDateTime generatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public Long getClassroomId() { return classroomId; }
    public void setClassroomId(Long classroomId) { this.classroomId = classroomId; }
    public String getWeakTopicsJson() { return weakTopicsJson; }
    public void setWeakTopicsJson(String weakTopicsJson) { this.weakTopicsJson = weakTopicsJson; }
    public String getStrengthAreasJson() { return strengthAreasJson; }
    public void setStrengthAreasJson(String strengthAreasJson) { this.strengthAreasJson = strengthAreasJson; }
    public String getLearningRecommendations() { return learningRecommendations; }
    public void setLearningRecommendations(String learningRecommendations) { this.learningRecommendations = learningRecommendations; }
    public String getSuggestedActionItems() { return suggestedActionItems; }
    public void setSuggestedActionItems(String suggestedActionItems) { this.suggestedActionItems = suggestedActionItems; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

    public static StudentAIInsightBuilder builder() { return new StudentAIInsightBuilder(); }
    public static class StudentAIInsightBuilder {
        private Long id;
        private User student;
        private Long classroomId;
        private String weakTopicsJson;
        private String strengthAreasJson;
        private String learningRecommendations;
        private String suggestedActionItems;
        private LocalDateTime generatedAt = LocalDateTime.now();

        public StudentAIInsightBuilder id(Long id) { this.id = id; return this; }
        public StudentAIInsightBuilder student(User student) { this.student = student; return this; }
        public StudentAIInsightBuilder classroomId(Long classroomId) { this.classroomId = classroomId; return this; }
        public StudentAIInsightBuilder weakTopicsJson(String weakTopicsJson) { this.weakTopicsJson = weakTopicsJson; return this; }
        public StudentAIInsightBuilder strengthAreasJson(String strengthAreasJson) { this.strengthAreasJson = strengthAreasJson; return this; }
        public StudentAIInsightBuilder learningRecommendations(String learningRecommendations) { this.learningRecommendations = learningRecommendations; return this; }
        public StudentAIInsightBuilder suggestedActionItems(String suggestedActionItems) { this.suggestedActionItems = suggestedActionItems; return this; }
        public StudentAIInsightBuilder generatedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; return this; }

        public StudentAIInsight build() {
            StudentAIInsight s = new StudentAIInsight();
            s.setId(id); s.setStudent(student); s.setClassroomId(classroomId);
            s.setWeakTopicsJson(weakTopicsJson); s.setStrengthAreasJson(strengthAreasJson);
            s.setLearningRecommendations(learningRecommendations);
            s.setSuggestedActionItems(suggestedActionItems); s.setGeneratedAt(generatedAt);
            return s;
        }
    }
}
