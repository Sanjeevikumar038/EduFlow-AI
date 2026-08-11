package com.eduflow.repository;

import com.eduflow.entity.AssessmentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface AssessmentQuestionRepository extends JpaRepository<AssessmentQuestion, Long> {

    List<AssessmentQuestion> findByAssessmentIdOrderByIdAsc(Long assessmentId);

    @Modifying
    @Transactional
    @Query("DELETE FROM AssessmentQuestion q WHERE q.assessment.id = :assessmentId")
    void deleteByAssessmentId(Long assessmentId);
}

