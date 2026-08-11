package com.eduflow.repository;

import com.eduflow.entity.ClassroomLectureHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassroomLectureHistoryRepository extends JpaRepository<ClassroomLectureHistory, Long> {

    List<ClassroomLectureHistory> findByClassroomIdOrderByLectureDateDescStartTimeDesc(Long classroomId);

    Optional<ClassroomLectureHistory> findByAttendanceSessionId(Long attendanceSessionId);

    long countByClassroomId(Long classroomId);
}
