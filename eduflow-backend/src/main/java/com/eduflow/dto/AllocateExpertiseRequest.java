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

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }
    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
    public ExpertiseLevel getExpertiseLevel() { return expertiseLevel; }
    public void setExpertiseLevel(ExpertiseLevel expertiseLevel) { this.expertiseLevel = expertiseLevel; }
}
