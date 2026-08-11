package com.eduflow.repository;

import com.eduflow.entity.ClassroomAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassroomAssignmentRepository extends JpaRepository<ClassroomAssignment, Long> {

    List<ClassroomAssignment> findByClassroomIdOrderByDueDateAsc(Long classroomId);

    long countByClassroomId(Long classroomId);
}
