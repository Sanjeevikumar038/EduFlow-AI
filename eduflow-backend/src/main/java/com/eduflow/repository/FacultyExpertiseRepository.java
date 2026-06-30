package com.eduflow.repository;

import com.eduflow.entity.FacultyExpertise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyExpertiseRepository extends JpaRepository<FacultyExpertise, Long> {
    List<FacultyExpertise> findByFacultyId(Long facultyId);
    List<FacultyExpertise> findBySubjectId(Long subjectId);
    Optional<FacultyExpertise> findByFacultyIdAndSubjectId(Long facultyId, Long subjectId);
    boolean existsByFacultyIdAndSubjectId(Long facultyId, Long subjectId);
    void deleteByFacultyId(Long facultyId);
    void deleteBySubjectId(Long subjectId);
}
