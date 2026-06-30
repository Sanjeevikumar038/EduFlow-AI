package com.eduflow.repository;

import com.eduflow.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    Optional<Classroom> findByRoomCodeIgnoreCase(String roomCode);
    boolean existsByRoomCodeIgnoreCase(String roomCode);
    List<Classroom> findByActiveTrue();
    List<Classroom> findByRoomType(String roomType);
}
