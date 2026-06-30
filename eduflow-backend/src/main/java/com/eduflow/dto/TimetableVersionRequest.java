package com.eduflow.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TimetableVersionRequest {
    private String department;
    private Integer semester;
    private String academicYear;
    private String versionName;
}
