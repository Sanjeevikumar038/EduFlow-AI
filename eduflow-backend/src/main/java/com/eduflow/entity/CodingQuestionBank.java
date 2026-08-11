package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coding_question_bank")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingQuestionBank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String difficulty; // e.g. "Easy", "Medium", "Hard"

    private String category; // e.g. "Array", "String", "DP"

    private String tags; // e.g. "Math, String"

    @Column(columnDefinition = "TEXT")
    private String constraints;

    @Column(columnDefinition = "TEXT")
    private String sampleInput;

    @Column(columnDefinition = "TEXT")
    private String sampleOutput;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(columnDefinition = "TEXT")
    private String boilerplateJava;

    @Column(columnDefinition = "TEXT")
    private String boilerplateC;

    @Column(columnDefinition = "TEXT")
    private String boilerplateCpp;

    @Column(columnDefinition = "TEXT")
    private String boilerplatePython;

    @Column(columnDefinition = "TEXT")
    private String testCasesJson; // array of {"input": "...", "expected": "..."}

    private Integer timeLimit; // in milliseconds
    private Integer memoryLimit; // in MB

    private String createdBy;

    private boolean active = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public String getConstraints() { return constraints; }
    public void setConstraints(String constraints) { this.constraints = constraints; }
    public String getSampleInput() { return sampleInput; }
    public void setSampleInput(String sampleInput) { this.sampleInput = sampleInput; }
    public String getSampleOutput() { return sampleOutput; }
    public void setSampleOutput(String sampleOutput) { this.sampleOutput = sampleOutput; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public String getBoilerplateJava() { return boilerplateJava; }
    public void setBoilerplateJava(String boilerplateJava) { this.boilerplateJava = boilerplateJava; }
    public String getBoilerplateC() { return boilerplateC; }
    public void setBoilerplateC(String boilerplateC) { this.boilerplateC = boilerplateC; }
    public String getBoilerplateCpp() { return boilerplateCpp; }
    public void setBoilerplateCpp(String boilerplateCpp) { this.boilerplateCpp = boilerplateCpp; }
    public String getBoilerplatePython() { return boilerplatePython; }
    public void setBoilerplatePython(String boilerplatePython) { this.boilerplatePython = boilerplatePython; }
    public String getTestCasesJson() { return testCasesJson; }
    public void setTestCasesJson(String testCasesJson) { this.testCasesJson = testCasesJson; }
    public Integer getTimeLimit() { return timeLimit; }
    public void setTimeLimit(Integer timeLimit) { this.timeLimit = timeLimit; }
    public Integer getMemoryLimit() { return memoryLimit; }
    public void setMemoryLimit(Integer memoryLimit) { this.memoryLimit = memoryLimit; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public static CodingQuestionBankBuilder builder() { return new CodingQuestionBankBuilder(); }
    public static class CodingQuestionBankBuilder {
        private Long id;
        private String title;
        private String description;
        private String difficulty;
        private String category;
        private String tags;
        private String constraints;
        private String sampleInput;
        private String sampleOutput;
        private String explanation;
        private String boilerplateJava;
        private String boilerplateC;
        private String boilerplateCpp;
        private String boilerplatePython;
        private String testCasesJson;
        private Integer timeLimit;
        private Integer memoryLimit;
        private String createdBy;
        private boolean active = true;

        public CodingQuestionBankBuilder id(Long id) { this.id = id; return this; }
        public CodingQuestionBankBuilder title(String title) { this.title = title; return this; }
        public CodingQuestionBankBuilder description(String description) { this.description = description; return this; }
        public CodingQuestionBankBuilder difficulty(String difficulty) { this.difficulty = difficulty; return this; }
        public CodingQuestionBankBuilder category(String category) { this.category = category; return this; }
        public CodingQuestionBankBuilder tags(String tags) { this.tags = tags; return this; }
        public CodingQuestionBankBuilder constraints(String constraints) { this.constraints = constraints; return this; }
        public CodingQuestionBankBuilder sampleInput(String sampleInput) { this.sampleInput = sampleInput; return this; }
        public CodingQuestionBankBuilder sampleOutput(String sampleOutput) { this.sampleOutput = sampleOutput; return this; }
        public CodingQuestionBankBuilder explanation(String explanation) { this.explanation = explanation; return this; }
        public CodingQuestionBankBuilder boilerplateJava(String boilerplateJava) { this.boilerplateJava = boilerplateJava; return this; }
        public CodingQuestionBankBuilder boilerplateC(String boilerplateC) { this.boilerplateC = boilerplateC; return this; }
        public CodingQuestionBankBuilder boilerplateCpp(String boilerplateCpp) { this.boilerplateCpp = boilerplateCpp; return this; }
        public CodingQuestionBankBuilder boilerplatePython(String boilerplatePython) { this.boilerplatePython = boilerplatePython; return this; }
        public CodingQuestionBankBuilder testCasesJson(String testCasesJson) { this.testCasesJson = testCasesJson; return this; }
        public CodingQuestionBankBuilder timeLimit(Integer timeLimit) { this.timeLimit = timeLimit; return this; }
        public CodingQuestionBankBuilder memoryLimit(Integer memoryLimit) { this.memoryLimit = memoryLimit; return this; }
        public CodingQuestionBankBuilder createdBy(String createdBy) { this.createdBy = createdBy; return this; }
        public CodingQuestionBankBuilder active(boolean active) { this.active = active; return this; }

        public CodingQuestionBank build() {
            CodingQuestionBank q = new CodingQuestionBank();
            q.setId(id); q.setTitle(title); q.setDescription(description);
            q.setDifficulty(difficulty); q.setCategory(category); q.setTags(tags);
            q.setConstraints(constraints); q.setSampleInput(sampleInput); q.setSampleOutput(sampleOutput);
            q.setExplanation(explanation); q.setBoilerplateJava(boilerplateJava);
            q.setBoilerplateC(boilerplateC); q.setBoilerplateCpp(boilerplateCpp);
            q.setBoilerplatePython(boilerplatePython); q.setTestCasesJson(testCasesJson);
            q.setTimeLimit(timeLimit); q.setMemoryLimit(memoryLimit); q.setCreatedBy(createdBy);
            q.setActive(active);
            return q;
        }
    }
}
