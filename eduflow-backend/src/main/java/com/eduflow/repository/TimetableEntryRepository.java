package com.eduflow.repository;

import com.eduflow.entity.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, Long> {
    List<TimetableEntry> findByDepartmentIgnoreCase(String department);
    List<TimetableEntry> findByFacultyId(Long facultyId);
    void deleteByDepartmentIgnoreCase(String department);
    boolean existsBySubjectIgnoreCase(String subject);

    // Version-aware queries
    List<TimetableEntry> findByVersionId(Long versionId);
    void deleteByVersionId(Long versionId);

    // Room clash detection: same room, same day, same period, active version
    @Query("SELECT e FROM TimetableEntry e WHERE e.room.id = :roomId AND e.dayOfWeek = :day AND e.period = :period AND e.version.active = true AND e.id != :excludeId")
    List<TimetableEntry> findRoomClashes(@Param("roomId") Long roomId, @Param("day") String day, @Param("period") Integer period, @Param("excludeId") Long excludeId);

    // Faculty double-booking: same faculty, same day, same period, active version
    @Query("SELECT e FROM TimetableEntry e WHERE e.faculty.id = :facultyId AND e.dayOfWeek = :day AND e.period = :period AND e.version.active = true AND e.id != :excludeId")
    List<TimetableEntry> findFacultyClashes(@Param("facultyId") Long facultyId, @Param("day") String day, @Param("period") Integer period, @Param("excludeId") Long excludeId);

    // Active timetable for a department + semester
    List<TimetableEntry> findByDepartmentIgnoreCaseAndSemesterAndVersionActiveTrue(String department, Integer semester);

    // Count periods assigned to a faculty in active timetable
    @Query("SELECT COUNT(e) FROM TimetableEntry e WHERE e.faculty.id = :facultyId AND e.version.active = true")
    long countActivePeriodsByFaculty(@Param("facultyId") Long facultyId);
}
