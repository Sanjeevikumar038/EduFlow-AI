package com.eduflow.repository;

import com.eduflow.entity.FacultyAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyAvailabilityRepository extends JpaRepository<FacultyAvailability, Long> {
    List<FacultyAvailability> findByFacultyId(Long facultyId);
    List<FacultyAvailability> findByDate(LocalDate date);
    List<FacultyAvailability> findByDateBetween(LocalDate start, LocalDate end);
    Optional<FacultyAvailability> findByFacultyIdAndDate(Long facultyId, LocalDate date);
    // Find all faculty on leave (available=false) for a given date
    List<FacultyAvailability> findByDateAndAvailableFalse(LocalDate date);
}
