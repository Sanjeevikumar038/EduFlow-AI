package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long studentId;

    private Long facultyApproverId;

    @Column(nullable = false)
    private String department;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveType type;

    @Column(nullable = false)
    private LocalDate fromDate;

    @Column(nullable = false)
    private LocalDate toDate;

    @Column(length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private LeaveStatus status = LeaveStatus.PENDING;

    private String rejectionReason;

    private LocalDateTime reviewedAt;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Transient
    private String studentName;

    @Transient
    private String facultyName;

    @Transient
    private String registerNumber;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getFacultyApproverId() { return facultyApproverId; }
    public void setFacultyApproverId(Long facultyApproverId) { this.facultyApproverId = facultyApproverId; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public LeaveType getType() { return type; }
    public void setType(LeaveType type) { this.type = type; }
    public LocalDate getFromDate() { return fromDate; }
    public void setFromDate(LocalDate fromDate) { this.fromDate = fromDate; }
    public LocalDate getToDate() { return toDate; }
    public void setToDate(LocalDate toDate) { this.toDate = toDate; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LeaveStatus getStatus() { return status; }
    public void setStatus(LeaveStatus status) { this.status = status; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }
    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public static LeaveRequestBuilder builder() { return new LeaveRequestBuilder(); }
    public static class LeaveRequestBuilder {
        private Long id;
        private Long studentId;
        private Long facultyApproverId;
        private String department;
        private LeaveType type;
        private LocalDate fromDate;
        private LocalDate toDate;
        private String reason;
        private LeaveStatus status = LeaveStatus.PENDING;
        private String rejectionReason;
        private LocalDateTime reviewedAt;
        private LocalDateTime createdAt = LocalDateTime.now();
        private String studentName;
        private String facultyName;
        private String registerNumber;

        public LeaveRequestBuilder id(Long id) { this.id = id; return this; }
        public LeaveRequestBuilder studentId(Long studentId) { this.studentId = studentId; return this; }
        public LeaveRequestBuilder facultyApproverId(Long facultyApproverId) { this.facultyApproverId = facultyApproverId; return this; }
        public LeaveRequestBuilder department(String department) { this.department = department; return this; }
        public LeaveRequestBuilder type(LeaveType type) { this.type = type; return this; }
        public LeaveRequestBuilder fromDate(LocalDate fromDate) { this.fromDate = fromDate; return this; }
        public LeaveRequestBuilder toDate(LocalDate toDate) { this.toDate = toDate; return this; }
        public LeaveRequestBuilder reason(String reason) { this.reason = reason; return this; }
        public LeaveRequestBuilder status(LeaveStatus status) { this.status = status; return this; }
        public LeaveRequestBuilder rejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; return this; }
        public LeaveRequestBuilder reviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; return this; }
        public LeaveRequestBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public LeaveRequestBuilder studentName(String studentName) { this.studentName = studentName; return this; }
        public LeaveRequestBuilder facultyName(String facultyName) { this.facultyName = facultyName; return this; }
        public LeaveRequestBuilder registerNumber(String registerNumber) { this.registerNumber = registerNumber; return this; }

        public LeaveRequest build() {
            LeaveRequest lr = new LeaveRequest();
            lr.setId(id); lr.setStudentId(studentId); lr.setFacultyApproverId(facultyApproverId);
            lr.setDepartment(department); lr.setType(type); lr.setFromDate(fromDate);
            lr.setToDate(toDate); lr.setReason(reason);
            if (status != null) lr.setStatus(status);
            lr.setRejectionReason(rejectionReason); lr.setReviewedAt(reviewedAt);
            if (createdAt != null) lr.setCreatedAt(createdAt);
            lr.setStudentName(studentName); lr.setFacultyName(facultyName);
            lr.setRegisterNumber(registerNumber);
            return lr;
        }
    }
}
