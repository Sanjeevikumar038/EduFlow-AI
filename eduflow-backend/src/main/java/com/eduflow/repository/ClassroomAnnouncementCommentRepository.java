package com.eduflow.repository;

import com.eduflow.entity.ClassroomAnnouncementComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassroomAnnouncementCommentRepository extends JpaRepository<ClassroomAnnouncementComment, Long> {

    List<ClassroomAnnouncementComment> findByAnnouncementIdOrderByCreatedAtAsc(Long announcementId);

    long countByAnnouncementId(Long announcementId);
}
