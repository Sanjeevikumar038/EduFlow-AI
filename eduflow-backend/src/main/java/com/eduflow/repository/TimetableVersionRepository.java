package com.eduflow.repository;

import com.eduflow.entity.TimetableVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimetableVersionRepository extends JpaRepository<TimetableVersion, Long> {
    List<TimetableVersion> findByDepartmentIgnoreCase(String department);
    List<TimetableVersion> findByDepartmentIgnoreCaseAndSemester(String department, Integer semester);
    List<TimetableVersion> findByActiveTrue();
    Optional<TimetableVersion> findByDepartmentIgnoreCaseAndSemesterAndActiveTrue(String department, Integer semester);
    Optional<TimetableVersion> findByDepartmentIgnoreCaseAndActiveTrue(String department);
    boolean existsByDepartmentIgnoreCaseAndSemesterAndActiveTrue(String department, Integer semester);
}
