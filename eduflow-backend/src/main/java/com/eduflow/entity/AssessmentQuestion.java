package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "assessment_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = false)
    private ClassroomAssessment assessment;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String questionText;

    // MCQ, PROGRAMMING, SHORT_ANSWER
    private String questionType;

    @Builder.Default
    private Integer marks = 5;

    private Integer wordLimit; // Optional for SHORT_ANSWER

    private Long codingProblemId; // Optional reference to CodingQuestionBank for PROGRAMMING assessment

    @Column(columnDefinition = "TEXT")
    private String optionsJson; // Formatted JSON string of options e.g. ["A", "B", "C", "D"]

    @Column(columnDefinition = "TEXT")
    private String correctAnswer; // Index or text of correct answer

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ClassroomAssessment getAssessment() { return assessment; }
    public void setAssessment(ClassroomAssessment assessment) { this.assessment = assessment; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }
    public Integer getMarks() { return marks; }
    public void setMarks(Integer marks) { this.marks = marks; }
    public Integer getWordLimit() { return wordLimit; }
    public void setWordLimit(Integer wordLimit) { this.wordLimit = wordLimit; }
    public Long getCodingProblemId() { return codingProblemId; }
    public void setCodingProblemId(Long codingProblemId) { this.codingProblemId = codingProblemId; }
    public String getOptionsJson() { return optionsJson; }
    public void setOptionsJson(String optionsJson) { this.optionsJson = optionsJson; }
    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

    public static AssessmentQuestionBuilder builder() { return new AssessmentQuestionBuilder(); }
    public static class AssessmentQuestionBuilder {
        private Long id;
        private ClassroomAssessment assessment;
        private String questionText;
        private String questionType;
        private Integer marks = 5;
        private Integer wordLimit;
        private Long codingProblemId;
        private String optionsJson;
        private String correctAnswer;

        public AssessmentQuestionBuilder id(Long id) { this.id = id; return this; }
        public AssessmentQuestionBuilder assessment(ClassroomAssessment assessment) { this.assessment = assessment; return this; }
        public AssessmentQuestionBuilder questionText(String questionText) { this.questionText = questionText; return this; }
        public AssessmentQuestionBuilder questionType(String questionType) { this.questionType = questionType; return this; }
        public AssessmentQuestionBuilder marks(Integer marks) { this.marks = marks; return this; }
        public AssessmentQuestionBuilder wordLimit(Integer wordLimit) { this.wordLimit = wordLimit; return this; }
        public AssessmentQuestionBuilder codingProblemId(Long codingProblemId) { this.codingProblemId = codingProblemId; return this; }
        public AssessmentQuestionBuilder optionsJson(String optionsJson) { this.optionsJson = optionsJson; return this; }
        public AssessmentQuestionBuilder correctAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; return this; }

        public AssessmentQuestion build() {
            AssessmentQuestion q = new AssessmentQuestion();
            q.setId(id); q.setAssessment(assessment); q.setQuestionText(questionText);
            q.setQuestionType(questionType);
            if (marks != null) q.setMarks(marks);
            q.setWordLimit(wordLimit); q.setCodingProblemId(codingProblemId);
            q.setOptionsJson(optionsJson); q.setCorrectAnswer(correctAnswer);
            return q;
        }
    }
}
