package com.eduflow.repository;

import com.eduflow.entity.Resume;
import com.eduflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByStudentOrderByUploadedDateDesc(User student);
    Optional<Resume> findFirstByStudentOrderByUploadedDateDesc(User student);
}
