package com.eduflow.repository;

import com.eduflow.entity.InterviewResponse;
import com.eduflow.entity.InterviewAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewResponseRepository extends JpaRepository<InterviewResponse, Long> {
    List<InterviewResponse> findByAttemptOrderByQuestionNumberAsc(InterviewAttempt attempt);
}
