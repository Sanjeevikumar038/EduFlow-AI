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

    public LeaveType getType() { return type; }
    public void setType(LeaveType type) { this.type = type; }
    public LocalDate getFromDate() { return fromDate; }
    public void setFromDate(LocalDate fromDate) { this.fromDate = fromDate; }
    public LocalDate getToDate() { return toDate; }
    public void setToDate(LocalDate toDate) { this.toDate = toDate; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }
    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }
    public String getStatusValue() { return statusValue; }
    public void setStatusValue(String statusValue) { this.statusValue = statusValue; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public static LeaveRequestDtoBuilder builder() { return new LeaveRequestDtoBuilder(); }
    public static class LeaveRequestDtoBuilder {
        private LeaveType type;
        private LocalDate fromDate;
        private LocalDate toDate;
        private String reason;
        private String rejectionReason;
        private String department;
        private String status;
        private Long id;
        private Long studentId;
        private String studentName;
        private String registerNumber;
        private String facultyName;
        private String statusValue;
        private LocalDateTime createdAt;
        private LocalDateTime reviewedAt;

        public LeaveRequestDtoBuilder type(LeaveType type) { this.type = type; return this; }
        public LeaveRequestDtoBuilder fromDate(LocalDate fromDate) { this.fromDate = fromDate; return this; }
        public LeaveRequestDtoBuilder toDate(LocalDate toDate) { this.toDate = toDate; return this; }
        public LeaveRequestDtoBuilder reason(String reason) { this.reason = reason; return this; }
        public LeaveRequestDtoBuilder rejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; return this; }
        public LeaveRequestDtoBuilder department(String department) { this.department = department; return this; }
        public LeaveRequestDtoBuilder status(String status) { this.status = status; return this; }
        public LeaveRequestDtoBuilder id(Long id) { this.id = id; return this; }
        public LeaveRequestDtoBuilder studentId(Long studentId) { this.studentId = studentId; return this; }
        public LeaveRequestDtoBuilder studentName(String studentName) { this.studentName = studentName; return this; }
        public LeaveRequestDtoBuilder registerNumber(String registerNumber) { this.registerNumber = registerNumber; return this; }
        public LeaveRequestDtoBuilder facultyName(String facultyName) { this.facultyName = facultyName; return this; }
        public LeaveRequestDtoBuilder statusValue(String statusValue) { this.statusValue = statusValue; return this; }
        public LeaveRequestDtoBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public LeaveRequestDtoBuilder reviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; return this; }

        public LeaveRequestDto build() {
            LeaveRequestDto dto = new LeaveRequestDto();
            dto.setType(type); dto.setFromDate(fromDate); dto.setToDate(toDate);
            dto.setReason(reason); dto.setRejectionReason(rejectionReason);
            dto.setDepartment(department); dto.setStatus(status); dto.setId(id);
            dto.setStudentId(studentId); dto.setStudentName(studentName);
            dto.setRegisterNumber(registerNumber); dto.setFacultyName(facultyName);
            dto.setStatusValue(statusValue); dto.setCreatedAt(createdAt);
            dto.setReviewedAt(reviewedAt);
            return dto;
        }
    }
}
