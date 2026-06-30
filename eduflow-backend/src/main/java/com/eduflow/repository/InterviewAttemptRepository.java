package com.eduflow.repository;

import com.eduflow.entity.InterviewAttempt;
import com.eduflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewAttemptRepository extends JpaRepository<InterviewAttempt, Long> {
    List<InterviewAttempt> findByStudentOrderByStartedAtDesc(User student);
}
