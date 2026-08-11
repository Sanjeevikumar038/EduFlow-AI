package com.eduflow.repository;

import com.eduflow.entity.StudentGradeSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentGradeSummaryRepository extends JpaRepository<StudentGradeSummary, Long> {
    List<StudentGradeSummary> findByStudentId(Long studentId);
    Optional<StudentGradeSummary> findByStudentIdAndClassroomId(Long studentId, Long classroomId);
    List<StudentGradeSummary> findByClassroomId(Long classroomId);
    List<StudentGradeSummary> findByClassroomIdAndAtRiskTrue(Long classroomId);
}
