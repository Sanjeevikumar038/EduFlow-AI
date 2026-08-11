package com.eduflow.repository;

import com.eduflow.entity.AssessmentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt, Long> {

    List<AssessmentAttempt> findByAssessmentId(Long assessmentId);

    Optional<AssessmentAttempt> findByAssessmentIdAndStudentId(Long assessmentId, Long studentId);

    List<AssessmentAttempt> findByStudentIdOrderByStartedAtDesc(Long studentId);

    long countByAssessmentId(Long assessmentId);

    @Modifying
    @Transactional
    @Query("DELETE FROM AssessmentAttempt a WHERE a.assessment.id = :assessmentId")
    void deleteByAssessmentId(Long assessmentId);
}

