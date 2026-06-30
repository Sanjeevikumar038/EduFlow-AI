package com.eduflow.dto;

import com.eduflow.entity.LeaveType;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestDto {
    // For submit requests (student → backend)
    private LeaveType type;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String reason;

    // For reject requests (faculty → backend)
    private String rejectionReason;

    // For admin/faculty filter queries
    private String department;
    private String status;

    // Response fields (populated by controller)
    private Long id;
    private Long studentId;
    private String studentName;
    private String registerNumber;
    private String facultyName;
    private String statusValue;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
}
