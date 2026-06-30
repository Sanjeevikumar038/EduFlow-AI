package com.eduflow.repository;

import com.eduflow.entity.InterviewResult;
import com.eduflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewResultRepository extends JpaRepository<InterviewResult, Long> {
    List<InterviewResult> findByStudentOrderByDateDesc(User student);
}
