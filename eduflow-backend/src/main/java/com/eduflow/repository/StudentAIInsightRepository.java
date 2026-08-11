package com.eduflow.repository;

import com.eduflow.entity.StudentAIInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentAIInsightRepository extends JpaRepository<StudentAIInsight, Long> {
    List<StudentAIInsight> findByStudentId(Long studentId);
    Optional<StudentAIInsight> findByStudentIdAndClassroomId(Long studentId, Long classroomId);
}
