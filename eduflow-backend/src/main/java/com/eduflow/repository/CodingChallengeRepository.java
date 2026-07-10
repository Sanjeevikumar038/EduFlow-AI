package com.eduflow.repository;

import com.eduflow.entity.CodingChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CodingChallengeRepository extends JpaRepository<CodingChallenge, Long> {
    Optional<CodingChallenge> findByDepartmentIgnoreCaseAndDate(String department, LocalDate date);
    List<CodingChallenge> findByDepartmentIgnoreCase(String department);
}
