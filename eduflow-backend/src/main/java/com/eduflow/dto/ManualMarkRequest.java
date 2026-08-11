package com.eduflow.dto;

import lombok.Data;

@Data
public class ManualMarkRequest {
    private Long studentId;
    private String status; // PRESENT, ABSENT, LATE, EXCUSED
    private String remarks;

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
