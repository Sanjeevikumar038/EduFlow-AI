package com.eduflow.controller;

import com.eduflow.dto.*;
import com.eduflow.entity.*;
import com.eduflow.repository.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private com.eduflow.service.AuthService authService;
    @Autowired private SubjectMasterRepository subjectMasterRepository;
    @Autowired private FacultyExpertiseRepository facultyExpertiseRepository;
    @Autowired private FacultyAvailabilityRepository facultyAvailabilityRepository;
    @Autowired private TimetableVersionRepository timetableVersionRepository;
    @Autowired private TimetableEntryRepository timetableEntryRepository;
    @Autowired private ClassroomRepository classroomRepository;
    @Autowired private AttendanceSessionRepository attendanceSessionRepository;

    // ─────────────────────────────────────────
    //  FACULTY MANAGEMENT
    // ─────────────────────────────────────────

    @PostMapping("/create-faculty")
    public ResponseEntity<?> createFaculty(@Valid @RequestBody FacultyCreateRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already registered!");
        }
        User faculty = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.FACULTY)
                .department(request.getDepartment())
                .build();
        userRepository.save(faculty);
        return ResponseEntity.ok("Faculty account created successfully for: " + faculty.getEmail());
    }

    @GetMapping("/faculty")
    public ResponseEntity<List<User>> getAllFaculty() {
        return ResponseEntity.ok(userRepository.findByRole(Role.FACULTY));
    }

    @DeleteMapping("/faculty/{id}")
    @Transactional
    public ResponseEntity<?> deleteFaculty(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    if (user.getRole() != Role.FACULTY) {
                        return ResponseEntity.badRequest().body("User is not a faculty member!");
                    }
                    facultyExpertiseRepository.deleteByFacultyId(id);
                    userRepository.delete(user);
                    return ResponseEntity.ok("Faculty account deleted successfully!");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────
    //  STUDENT MANAGEMENT
    // ─────────────────────────────────────────

    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).body("Unauthorized");
        Optional<User> currentUserOpt = userRepository.findByEmail(userDetails.getUsername());
        if (currentUserOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User currentUser = currentUserOpt.get();
        if (currentUser.getRole() == Role.ADMIN) {
            return ResponseEntity.ok(userRepository.findByRole(Role.STUDENT));
        } else if (currentUser.getRole() == Role.FACULTY) {
            String dept = currentUser.getDepartment();
            if (dept == null || dept.trim().isEmpty()) return ResponseEntity.ok(List.of());
            return ResponseEntity.ok(userRepository.findByRoleAndDepartmentIgnoreCase(Role.STUDENT, dept));
        } else {
            return ResponseEntity.status(403).body("Access denied");
        }
    }

    @PostMapping("/create-student")
    public ResponseEntity<?> createStudent(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already registered!");
        }
        String regNum = authService.generateNextRegisterNumber(request.getDepartment());
        User student = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .registerNumber(regNum)
                .department(request.getDepartment())
                .build();
        userRepository.save(student);
        return ResponseEntity.ok("Student account created successfully!");
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    if (user.getRole() != Role.STUDENT) {
                        return ResponseEntity.badRequest().body("User is not a student!");
                    }
                    userRepository.delete(user);
                    return ResponseEntity.ok("Student account deleted successfully!");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────
    //  SUBJECT MASTER
    // ─────────────────────────────────────────

    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectMaster>> getAllSubjects(
            @RequestParam(required = false) String department) {
        if (department != null && !department.trim().isEmpty()) {
            return ResponseEntity.ok(subjectMasterRepository.findByDepartmentIgnoreCase(department));
        }
        return ResponseEntity.ok(subjectMasterRepository.findAll());
    }

    @GetMapping("/subjects/active")
    public ResponseEntity<List<SubjectMaster>> getActiveSubjects() {
        return ResponseEntity.ok(subjectMasterRepository.findByActiveTrue());
    }

    @PostMapping("/subjects")
    public ResponseEntity<?> createSubject(@RequestBody SubjectMasterRequest request) {
        if (subjectMasterRepository.existsBySubjectCodeIgnoreCase(request.getSubjectCode())) {
            return ResponseEntity.badRequest().body("Subject code already exists: " + request.getSubjectCode());
        }
        SubjectMaster subject = SubjectMaster.builder()
                .subjectCode(request.getSubjectCode().toUpperCase())
                .subjectName(request.getSubjectName())
                .department(request.getDepartment())
                .semester(request.getSemester())
                .academicYear(request.getAcademicYear())
                .credits(request.getCredits())
                .weeklyHours(request.getWeeklyHours())
                .subjectCategory(request.getSubjectCategory())
                .active(true)
                .build();
        subjectMasterRepository.save(subject);
        return ResponseEntity.ok(subject);
    }

    @PutMapping("/subjects/{id}")
    public ResponseEntity<?> updateSubject(@PathVariable Long id, @RequestBody SubjectMasterRequest request) {
        return subjectMasterRepository.findById(id).map(subject -> {
            subject.setSubjectName(request.getSubjectName());
            subject.setDepartment(request.getDepartment());
            subject.setSemester(request.getSemester());
            subject.setAcademicYear(request.getAcademicYear());
            subject.setCredits(request.getCredits());
            subject.setWeeklyHours(request.getWeeklyHours());
            subject.setSubjectCategory(request.getSubjectCategory());
            subjectMasterRepository.save(subject);
            return ResponseEntity.ok(subject);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/subjects/{id}")
    @Transactional
    public ResponseEntity<?> deleteSubject(@PathVariable Long id) {
        return subjectMasterRepository.findById(id).map(subject -> {
            // Dependency check: timetable
            if (timetableEntryRepository.existsBySubjectIgnoreCase(subject.getSubjectCode())) {
                // Soft delete
                subject.setActive(false);
                subjectMasterRepository.save(subject);
                return ResponseEntity.ok("Subject deactivated (used in timetable): " + subject.getSubjectCode());
            }
            // Dependency check: attendance
            if (attendanceSessionRepository.existsBySubjectIgnoreCase(subject.getSubjectCode())) {
                subject.setActive(false);
                subjectMasterRepository.save(subject);
                return ResponseEntity.ok("Subject deactivated (used in attendance): " + subject.getSubjectCode());
            }
            facultyExpertiseRepository.deleteBySubjectId(id);
            subjectMasterRepository.delete(subject);
            return ResponseEntity.ok("Subject deleted: " + subject.getSubjectCode());
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────
    //  FACULTY EXPERTISE
    // ─────────────────────────────────────────

    @GetMapping("/faculty-expertise")
    public ResponseEntity<List<FacultyExpertise>> getAllExpertise() {
        return ResponseEntity.ok(facultyExpertiseRepository.findAll());
    }

    @GetMapping("/faculty-expertise/faculty/{facultyId}")
    public ResponseEntity<List<FacultyExpertise>> getExpertiseByFaculty(@PathVariable Long facultyId) {
        return ResponseEntity.ok(facultyExpertiseRepository.findByFacultyId(facultyId));
    }

    @PostMapping("/faculty-expertise/allocate")
    public ResponseEntity<?> allocateExpertise(@RequestBody AllocateExpertiseRequest request) {
        Optional<User> facultyOpt = userRepository.findById(request.getFacultyId());
        Optional<SubjectMaster> subjectOpt = subjectMasterRepository.findById(request.getSubjectId());
        if (facultyOpt.isEmpty()) return ResponseEntity.badRequest().body("Faculty not found!");
        if (subjectOpt.isEmpty()) return ResponseEntity.badRequest().body("Subject not found!");

        // Upsert: update if already exists
        Optional<FacultyExpertise> existing = facultyExpertiseRepository
                .findByFacultyIdAndSubjectId(request.getFacultyId(), request.getSubjectId());

        FacultyExpertise expertise = existing.orElse(FacultyExpertise.builder()
                .faculty(facultyOpt.get())
                .subject(subjectOpt.get())
                .build());
        expertise.setExpertiseLevel(request.getExpertiseLevel());
        facultyExpertiseRepository.save(expertise);
        return ResponseEntity.ok(expertise);
    }

    @DeleteMapping("/faculty-expertise/{id}")
    public ResponseEntity<?> removeExpertise(@PathVariable Long id) {
        return facultyExpertiseRepository.findById(id).map(e -> {
            facultyExpertiseRepository.delete(e);
            return ResponseEntity.ok("Expertise allocation removed.");
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────
    //  FACULTY AVAILABILITY / LEAVES
    // ─────────────────────────────────────────

    @GetMapping("/faculty-availability")
    public ResponseEntity<List<FacultyAvailability>> getAllAvailability(
            @RequestParam(required = false) Long facultyId,
            @RequestParam(required = false) String date) {
        if (facultyId != null) {
            return ResponseEntity.ok(facultyAvailabilityRepository.findByFacultyId(facultyId));
        }
        if (date != null) {
            return ResponseEntity.ok(facultyAvailabilityRepository.findByDate(LocalDate.parse(date)));
        }
        return ResponseEntity.ok(facultyAvailabilityRepository.findAll());
    }

    @PostMapping("/faculty-availability")
    public ResponseEntity<?> setAvailability(@RequestBody FacultyAvailabilityRequest request) {
        Optional<User> facultyOpt = userRepository.findById(request.getFacultyId());
        if (facultyOpt.isEmpty()) return ResponseEntity.badRequest().body("Faculty not found!");

        // Upsert by facultyId + date
        Optional<FacultyAvailability> existing = facultyAvailabilityRepository
                .findByFacultyIdAndDate(request.getFacultyId(), request.getDate());

        FacultyAvailability availability = existing.orElse(FacultyAvailability.builder()
                .faculty(facultyOpt.get())
                .build());
        availability.setDate(request.getDate());
        availability.setAvailable(request.getAvailable() != null ? request.getAvailable() : false);
        availability.setReason(request.getReason());
        facultyAvailabilityRepository.save(availability);
        return ResponseEntity.ok(availability);
    }

    @DeleteMapping("/faculty-availability/{id}")
    public ResponseEntity<?> deleteAvailability(@PathVariable Long id) {
        return facultyAvailabilityRepository.findById(id).map(a -> {
            facultyAvailabilityRepository.delete(a);
            return ResponseEntity.ok("Availability record removed.");
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────
    //  FACULTY WORKLOAD
    // ─────────────────────────────────────────

    @GetMapping("/faculty-workload")
    public ResponseEntity<List<FacultyWorkloadDto>> getFacultyWorkload() {
        List<User> allFaculty = userRepository.findByRole(Role.FACULTY);
        int totalPeriodsPerWeek = 40;

        List<FacultyWorkloadDto> result = allFaculty.stream().map(f -> {
            long allocated = timetableEntryRepository.countActivePeriodsByFaculty(f.getId());
            double utilization = (double) allocated / totalPeriodsPerWeek * 100.0;
            String status;
            if (utilization <= 30.0) status = "Under Utilized";
            else if (utilization <= 70.0) status = "Balanced";
            else status = "Heavy Load";

            return FacultyWorkloadDto.builder()
                    .facultyId(f.getId())
                    .facultyName(f.getName())
                    .department(f.getDepartment())
                    .allocatedPeriods(allocated)
                    .availablePeriods(totalPeriodsPerWeek)
                    .utilizationPercentage(Math.round(utilization * 100.0) / 100.0)
                    .workloadStatus(status)
                    .build();
        }).toList();

        return ResponseEntity.ok(result);
    }

    // ─────────────────────────────────────────
    //  CLASSROOMS
    // ─────────────────────────────────────────

    @GetMapping("/classrooms")
    public ResponseEntity<List<Classroom>> getAllClassrooms() {
        return ResponseEntity.ok(classroomRepository.findAll());
    }

    @PostMapping("/classrooms")
    public ResponseEntity<?> createClassroom(@RequestBody ClassroomRequest request) {
        if (classroomRepository.existsByRoomCodeIgnoreCase(request.getRoomCode())) {
            return ResponseEntity.badRequest().body("Room code already exists: " + request.getRoomCode());
        }
        Classroom room = Classroom.builder()
                .roomCode(request.getRoomCode().toUpperCase())
                .roomName(request.getRoomName())
                .capacity(request.getCapacity())
                .roomType(request.getRoomType())
                .active(true)
                .build();
        classroomRepository.save(room);
        return ResponseEntity.ok(room);
    }

    @DeleteMapping("/classrooms/{id}")
    public ResponseEntity<?> deleteClassroom(@PathVariable Long id) {
        return classroomRepository.findById(id).map(room -> {
            room.setActive(false);
            classroomRepository.save(room);
            return ResponseEntity.ok("Classroom deactivated: " + room.getRoomCode());
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────
    //  TIMETABLE VERSIONS
    // ─────────────────────────────────────────

    @GetMapping("/timetable-versions")
    public ResponseEntity<List<TimetableVersion>> getAllVersions(
            @RequestParam(required = false) String department) {
        if (department != null && !department.trim().isEmpty()) {
            return ResponseEntity.ok(timetableVersionRepository.findByDepartmentIgnoreCase(department));
        }
        return ResponseEntity.ok(timetableVersionRepository.findAll());
    }

    @PostMapping("/timetable-versions")
    public ResponseEntity<?> createVersion(@RequestBody TimetableVersionRequest request) {
        TimetableVersion version = TimetableVersion.builder()
                .department(request.getDepartment())
                .semester(request.getSemester())
                .academicYear(request.getAcademicYear())
                .versionName(request.getVersionName())
                .active(false)
                .build();
        timetableVersionRepository.save(version);
        return ResponseEntity.ok(version);
    }

    @PostMapping("/timetable-versions/activate/{id}")
    @Transactional
    public ResponseEntity<?> activateVersion(@PathVariable Long id) {
        return timetableVersionRepository.findById(id).map(version -> {
            // Deactivate all other versions for same dept + semester
            List<TimetableVersion> others = timetableVersionRepository
                    .findByDepartmentIgnoreCaseAndSemester(version.getDepartment(), version.getSemester());
            others.forEach(v -> {
                v.setActive(false);
                timetableVersionRepository.save(v);
            });
            version.setActive(true);
            timetableVersionRepository.save(version);
            return ResponseEntity.ok("Version activated: " + version.getVersionName());
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/timetable-versions/{id}")
    @Transactional
    public ResponseEntity<?> deleteVersion(@PathVariable Long id) {
        return timetableVersionRepository.findById(id).map(version -> {
            if (version.isActive()) {
                return ResponseEntity.badRequest().body("Cannot delete an active timetable version. Activate another version first.");
            }
            timetableEntryRepository.deleteByVersionId(id);
            timetableVersionRepository.delete(version);
            return ResponseEntity.ok("Version deleted: " + version.getVersionName());
        }).orElse(ResponseEntity.notFound().build());
    }
}
