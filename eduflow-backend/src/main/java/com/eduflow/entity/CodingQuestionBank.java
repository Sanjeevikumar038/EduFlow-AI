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

    private boolean active;
}
