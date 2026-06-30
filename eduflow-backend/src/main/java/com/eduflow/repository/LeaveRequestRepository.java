package com.eduflow.repository;

import com.eduflow.entity.LeaveRequest;
import com.eduflow.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByStudentId(Long studentId);
    List<LeaveRequest> findByDepartment(String department);
    List<LeaveRequest> findByDepartmentAndStatus(String department, LeaveStatus status);
    List<LeaveRequest> findByDepartmentIgnoreCase(String department);
    List<LeaveRequest> findByStudentIdAndFromDateLessThanEqualAndToDateGreaterThanEqualAndStatus(
        Long studentId, LocalDate toDate, LocalDate fromDate, LeaveStatus status);
}
