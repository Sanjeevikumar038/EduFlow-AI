package com.eduflow.dto;

import lombok.Data;

@Data
public class ManualMarkRequest {
    private Long studentId;
    private String status; // PRESENT, ABSENT, LATE, EXCUSED
    private String remarks;
}
