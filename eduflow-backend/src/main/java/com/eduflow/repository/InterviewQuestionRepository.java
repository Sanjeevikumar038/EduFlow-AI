package com.eduflow.repository;

import com.eduflow.entity.InterviewQuestion;
import com.eduflow.entity.InterviewDomain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {
    List<InterviewQuestion> findByDomainAndIsActiveTrue(InterviewDomain domain);
}
