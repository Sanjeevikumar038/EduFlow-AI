package com.eduflow.repository;

import com.eduflow.entity.InterviewDomain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewDomainRepository extends JpaRepository<InterviewDomain, Long> {
    Optional<InterviewDomain> findByName(String name);
}
