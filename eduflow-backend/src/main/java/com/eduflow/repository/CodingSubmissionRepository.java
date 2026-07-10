package com.eduflow.repository;

import com.eduflow.entity.CodingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CodingSubmissionRepository extends JpaRepository<CodingSubmission, Long> {
    List<CodingSubmission> findByDate(LocalDate date);
    List<CodingSubmission> findByStudentId(Long studentId);
}
