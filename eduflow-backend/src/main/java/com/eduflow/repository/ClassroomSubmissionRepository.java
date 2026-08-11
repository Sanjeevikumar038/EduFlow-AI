package com.eduflow.repository;

import com.eduflow.entity.ClassroomSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassroomSubmissionRepository extends JpaRepository<ClassroomSubmission, Long> {

    List<ClassroomSubmission> findByAssignmentId(Long assignmentId);

    Optional<ClassroomSubmission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);

    List<ClassroomSubmission> findByStudentIdOrderBySubmittedAtDesc(Long studentId);

    long countByAssignmentId(Long assignmentId);

    long countByAssignmentIdAndStatus(Long assignmentId, String status);
}
