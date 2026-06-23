package com.eduflow.dto;

import lombok.*;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceReportRecord {
    private String studentName;
    private String registerNumber;
    private String status; // "PRESENT" or "ABSENT"
    private LocalTime time;
    private Double latitude;
    private Double longitude;
}
