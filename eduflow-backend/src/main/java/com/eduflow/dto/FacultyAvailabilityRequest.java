package com.eduflow.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FacultyAvailabilityRequest {
    private Long facultyId;
    private LocalDate date;
    private Boolean available;
    private String reason;
}
