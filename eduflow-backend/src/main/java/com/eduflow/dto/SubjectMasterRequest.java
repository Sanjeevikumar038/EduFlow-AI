package com.eduflow.dto;

import com.eduflow.entity.SubjectCategory;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubjectMasterRequest {
    private String subjectCode;
    private String subjectName;
    private String department;
    private Integer semester;
    private String academicYear;
    private Integer credits;
    private Integer weeklyHours;
    private SubjectCategory subjectCategory;
}
