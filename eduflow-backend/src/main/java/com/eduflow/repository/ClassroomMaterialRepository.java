package com.eduflow.repository;

import com.eduflow.entity.ClassroomMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassroomMaterialRepository extends JpaRepository<ClassroomMaterial, Long> {

    List<ClassroomMaterial> findByClassroomIdOrderByCreatedAtDesc(Long classroomId);

    List<ClassroomMaterial> findByClassroomIdAndMaterialTypeOrderByCreatedAtDesc(Long classroomId, String materialType);

    List<ClassroomMaterial> findByClassroomIdAndTopicOrderByCreatedAtDesc(Long classroomId, String topic);

    long countByClassroomId(Long classroomId);
}
