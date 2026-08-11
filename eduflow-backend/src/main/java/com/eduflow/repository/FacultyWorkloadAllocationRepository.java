package com.eduflow.repository;

import com.eduflow.entity.FacultyWorkloadAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacultyWorkloadAllocationRepository extends JpaRepository<FacultyWorkloadAllocation, Long> {

    List<FacultyWorkloadAllocation> findByFaculty_Id(Long facultyId);

    @Query("SELECT f FROM FacultyWorkloadAllocation f WHERE f.faculty.id = :facultyId")
    List<FacultyWorkloadAllocation> findByFacultyId(@Param("facultyId") Long facultyId);

    List<FacultyWorkloadAllocation> findByVersionName(String versionName);

    List<FacultyWorkloadAllocation> findByStatus(String status);

    List<FacultyWorkloadAllocation> findByVersionNameAndStatus(String versionName, String status);

    List<FacultyWorkloadAllocation> findByDepartmentIgnoreCase(String department);

    @Query("SELECT DISTINCT f.versionName FROM FacultyWorkloadAllocation f ORDER BY f.versionName DESC")
    List<String> findDistinctVersionNames();

    @Query("SELECT DISTINCT f.semester FROM FacultyWorkloadAllocation f WHERE f.semester IS NOT NULL ORDER BY f.semester ASC")
    List<Integer> findDistinctSemesters();

    @Query("SELECT COALESCE(SUM(f.hoursPerWeek), 0) FROM FacultyWorkloadAllocation f WHERE f.faculty.id = :facultyId AND f.status = 'APPROVED'")
    Long sumApprovedHoursByFacultyId(@Param("facultyId") Long facultyId);

    @Query("SELECT f.faculty.id, SUM(f.hoursPerWeek) FROM FacultyWorkloadAllocation f WHERE f.status = 'APPROVED' GROUP BY f.faculty.id")
    List<Object[]> sumApprovedHoursGroupByFaculty();

    @Query("SELECT COALESCE(SUM(f.hoursPerWeek), 0) FROM FacultyWorkloadAllocation f WHERE f.faculty.id = :facultyId AND f.versionName = :versionName")
    Long sumHoursByFacultyIdAndVersion(@Param("facultyId") Long facultyId, @Param("versionName") String versionName);

    @Modifying
    @Query("UPDATE FacultyWorkloadAllocation f SET f.status = 'ARCHIVED' WHERE f.academicYear = :academicYear AND f.semesterType = :semesterType AND f.status = 'APPROVED'")
    void archivePreviousApprovedAllocations(@Param("academicYear") String academicYear, @Param("semesterType") String semesterType);

    @Modifying
    @Query("UPDATE FacultyWorkloadAllocation f SET f.status = 'APPROVED' WHERE f.versionName = :versionName")
    void approveAllocationVersion(@Param("versionName") String versionName);

    @Modifying
    @Query("DELETE FROM FacultyWorkloadAllocation f WHERE f.versionName = :versionName")
    void deleteByVersionName(@Param("versionName") String versionName);
}
