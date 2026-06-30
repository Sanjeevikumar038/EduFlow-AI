package com.eduflow.repository;

import com.eduflow.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findBySessionId(Long sessionId);
    List<Attendance> findBySessionIdIn(List<Long> sessionIdList);
}

