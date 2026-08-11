package com.eduflow.repository;

import com.eduflow.entity.ClassroomAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassroomAnnouncementRepository extends JpaRepository<ClassroomAnnouncement, Long> {

    List<ClassroomAnnouncement> findByClassroomIdOrderByIsPinnedDescCreatedAtDesc(Long classroomId);

    long countByClassroomId(Long classroomId);
}
