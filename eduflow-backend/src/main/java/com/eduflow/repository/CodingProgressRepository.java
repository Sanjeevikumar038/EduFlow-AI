package com.eduflow.repository;

import com.eduflow.entity.CodingProgress;
import com.eduflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodingProgressRepository extends JpaRepository<CodingProgress, Long> {
    Optional<CodingProgress> findByStudent(User student);
}
