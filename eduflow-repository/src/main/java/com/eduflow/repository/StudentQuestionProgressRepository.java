package com.eduflow.repository;

import com.eduflow.entity.StudentQuestionProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentQuestionProgressRepository extends JpaRepository<StudentQuestionProgress, Long> {
    Optional<StudentQuestionProgress> findByStudentIdAndQuestionBankId(Long studentId, Long questionBankId);
    List<StudentQuestionProgress> findByStudentId(Long studentId);
}
