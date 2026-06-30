package com.eduflow.repository;

import com.eduflow.entity.SubjectMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectMasterRepository extends JpaRepository<SubjectMaster, Long> {
    List<SubjectMaster> findByDepartmentIgnoreCaseAndActiveTrue(String department);
    List<SubjectMaster> findByDepartmentIgnoreCase(String department);
    List<SubjectMaster> findByActiveTrue();
    Optional<SubjectMaster> findBySubjectCodeIgnoreCaseAndActiveTrue(String subjectCode);
    Optional<SubjectMaster> findBySubjectCodeIgnoreCase(String subjectCode);
    boolean existsBySubjectCodeIgnoreCase(String subjectCode);
}
