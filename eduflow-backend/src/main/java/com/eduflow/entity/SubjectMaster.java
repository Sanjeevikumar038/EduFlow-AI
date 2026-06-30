package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subject_master")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String subjectCode;

    @Column(nullable = false)
    private String subjectName;

    private String department;

    private Integer semester;

    private String academicYear;

    private Integer credits;

    private Integer weeklyHours;

    @Enumerated(EnumType.STRING)
    private SubjectCategory subjectCategory;

    @Builder.Default
    private boolean active = true;
}
