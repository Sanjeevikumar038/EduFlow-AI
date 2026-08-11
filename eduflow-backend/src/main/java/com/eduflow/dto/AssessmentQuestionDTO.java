package com.eduflow.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentQuestionDTO {
    private Long id;
    private String questionText;
    private String questionType; // MCQ, PROGRAMMING, SHORT_ANSWER
    private Integer marks;
    private Integer wordLimit;
    private Long codingProblemId;
    private List<String> options;
    private String correctAnswer;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }
    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

    public static AssessmentQuestionDTOBuilder builder() { return new AssessmentQuestionDTOBuilder(); }
    public static class AssessmentQuestionDTOBuilder {
        private Long id;
        private String questionText;
        private String questionType;
        private Integer marks;
        private Integer wordLimit;
        private Long codingProblemId;
        private List<String> options;
        private String correctAnswer;

        public AssessmentQuestionDTOBuilder id(Long id) { this.id = id; return this; }
        public AssessmentQuestionDTOBuilder questionText(String questionText) { this.questionText = questionText; return this; }
        public AssessmentQuestionDTOBuilder questionType(String questionType) { this.questionType = questionType; return this; }
        public AssessmentQuestionDTOBuilder marks(Integer marks) { this.marks = marks; return this; }
        public AssessmentQuestionDTOBuilder wordLimit(Integer wordLimit) { this.wordLimit = wordLimit; return this; }
        public AssessmentQuestionDTOBuilder codingProblemId(Long codingProblemId) { this.codingProblemId = codingProblemId; return this; }
        public AssessmentQuestionDTOBuilder options(List<String> options) { this.options = options; return this; }
        public AssessmentQuestionDTOBuilder correctAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; return this; }

        public AssessmentQuestionDTO build() {
            AssessmentQuestionDTO dto = new AssessmentQuestionDTO();
            dto.setId(id); dto.setQuestionText(questionText); dto.setQuestionType(questionType);
            dto.setMarks(marks); dto.setWordLimit(wordLimit); dto.setCodingProblemId(codingProblemId);
            dto.setOptions(options); dto.setCorrectAnswer(correctAnswer);
            return dto;
        }
    }
}
