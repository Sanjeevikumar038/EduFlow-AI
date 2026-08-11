package com.eduflow.repository;

import com.eduflow.entity.CourseClassroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseClassroomRepository extends JpaRepository<CourseClassroom, Long> {

    List<CourseClassroom> findByFacultyId(Long facultyId);

    List<CourseClassroom> findByDepartmentAndSemester(String department, Integer semester);

    List<CourseClassroom> findByDepartmentIgnoreCaseAndSemester(String department, Integer semester);

    List<CourseClassroom> findByDepartment(String department);

    List<CourseClassroom> findBySubjectCodeAndFacultyIdAndDepartmentAndSemester(
            String subjectCode, Long facultyId, String department, Integer semester);

    List<CourseClassroom> findBySubjectCodeAndFacultyIdAndDepartmentAndSemesterAndSection(
            String subjectCode, Long facultyId, String department, Integer semester, String section);

    List<CourseClassroom> findBySubjectCodeAndDepartmentAndSemester(
            String subjectCode, String department, Integer semester);
}
