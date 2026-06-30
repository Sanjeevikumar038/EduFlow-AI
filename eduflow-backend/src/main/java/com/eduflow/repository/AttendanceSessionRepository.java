package com.eduflow.repository;

import com.eduflow.entity.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    List<AttendanceSession> findByFacultyId(Long facultyId);
    List<AttendanceSession> findByActive(boolean active);
    List<AttendanceSession> findByFacultyIdIn(List<Long> facultyIds);
    boolean existsBySubjectIgnoreCase(String subject);
}
