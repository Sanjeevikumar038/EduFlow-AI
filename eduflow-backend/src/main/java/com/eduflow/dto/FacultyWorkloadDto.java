package com.eduflow.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyWorkloadDto {
    private Long facultyId;
    private String facultyName;
    private String department;
    private Long allocatedPeriods;
    private Integer availablePeriods; // default 40 per week
    private Double utilizationPercentage;
    private String workloadStatus; // "Under Utilized", "Balanced", "Heavy Load"
}
