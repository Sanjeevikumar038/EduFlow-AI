package com.eduflow.repository;

import com.eduflow.entity.CareerHistory;
import com.eduflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareerHistoryRepository extends JpaRepository<CareerHistory, Long> {
    List<CareerHistory> findByStudentOrderByCareerScoreDateAsc(User student);
}
