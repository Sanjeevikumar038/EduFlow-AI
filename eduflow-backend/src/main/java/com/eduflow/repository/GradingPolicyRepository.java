package com.eduflow.repository;

import com.eduflow.entity.GradingPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GradingPolicyRepository extends JpaRepository<GradingPolicy, Long> {
    Optional<GradingPolicy> findByClassroomId(Long classroomId);
    Optional<GradingPolicy> findByDepartmentAndSemester(String department, Integer semester);
}
