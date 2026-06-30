package com.eduflow.dto;

import com.eduflow.entity.ExpertiseLevel;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AllocateExpertiseRequest {
    private Long facultyId;
    private Long subjectId;
    private ExpertiseLevel expertiseLevel;
}
