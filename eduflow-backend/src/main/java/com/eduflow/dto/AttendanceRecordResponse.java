package com.eduflow.dto;

import lombok.*;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecordResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String registerNumber;
    private LocalTime time;
    private String status;
    private Double latitude;
    private Double longitude;
}
