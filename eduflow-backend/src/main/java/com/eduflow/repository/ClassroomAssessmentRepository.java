package com.eduflow.repository;

import com.eduflow.entity.ClassroomAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassroomAssessmentRepository extends JpaRepository<ClassroomAssessment, Long> {

    List<ClassroomAssessment> findByClassroomIdOrderByCreatedAtDesc(Long classroomId);

    List<ClassroomAssessment> findByClassroomIdAndAssessmentTypeOrderByCreatedAtDesc(Long classroomId, String assessmentType);

    long countByClassroomId(Long classroomId);
}
