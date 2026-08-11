package com.eduflow.controller;

import com.eduflow.dto.CurrentClassResponse;
import com.eduflow.dto.TimetableSuggestionResponse;
import com.eduflow.entity.*;
import com.eduflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    @Autowired private TimetableEntryRepository timetableEntryRepository;
    @Autowired private TimetableVersionRepository timetableVersionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private SubjectMasterRepository subjectMasterRepository;
    @Autowired private FacultyExpertiseRepository facultyExpertiseRepository;
    @Autowired private FacultyAvailabilityRepository facultyAvailabilityRepository;
    @Autowired private ClassroomRepository classroomRepository;
    @Autowired private CodingChallengeRepository codingChallengeRepository;
    @Autowired private CodingSubmissionRepository codingSubmissionRepository;
    @Autowired private AttendanceSessionRepository attendanceSessionRepository;
    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private FacultyWorkloadAllocationRepository facultyWorkloadAllocationRepository;
    @Autowired private com.eduflow.service.GroqService groqService;

    // ─── Period Time Definitions ───────────────────────────────────────────────
    private static class PeriodTime {
        int number;
        String name;
        LocalTime start;
        LocalTime end;
        boolean isBreak;
        PeriodTime(int n, String nm, LocalTime s, LocalTime e, boolean b) {
            number = n; name = nm; start = s; end = e; isBreak = b;
        }
    }

    private final List<PeriodTime> periods = List.of(
            new PeriodTime(1, "Period 1", LocalTime.of(8,45), LocalTime.of(9,40), false),
            new PeriodTime(2, "Period 2", LocalTime.of(9,40), LocalTime.of(10,35), false),
            new PeriodTime(0, "Short Break", LocalTime.of(10,35), LocalTime.of(10,50), true),
            new PeriodTime(3, "Period 3", LocalTime.of(10,50), LocalTime.of(11,45), false),
            new PeriodTime(4, "Period 4", LocalTime.of(11,45), LocalTime.of(12,40), false),
            new PeriodTime(0, "Lunch Break", LocalTime.of(12,40), LocalTime.of(13,40), true),
            new PeriodTime(5, "Period 5", LocalTime.of(13,40), LocalTime.of(14,35), false),
            new PeriodTime(6, "Period 6", LocalTime.of(14,35), LocalTime.of(15,30), false)
    );

    // ─── Helpers ───────────────────────────────────────────────────────────────
    public static String normalizeDepartment(String dept) {
        if (dept == null || dept.trim().isEmpty()) return "Department of Computer Science and Engineering";
        String upper = dept.trim().toUpperCase();

        if (upper.contains("MTECH") || upper.contains("M.TECH") || upper.contains("M.TECH. CSE")) {
            return "Department of MTech Computer Science and Engineering";
        }
        if (upper.contains("ARTIFICIAL INTELLIGENCE") || upper.contains("AI & DATA") || upper.contains("AI & DS") || upper.equals("AIDS") || upper.contains("AI AND DATA")) {
            return "Department of Artificial Intelligence and Data Science";
        }
        if (upper.contains("BUSINESS SYSTEMS") || upper.equals("CSBS")) {
            return "Department of Computer Science and Business Systems";
        }
        if (upper.equals("CSE") || upper.equals("COMPUTER SCIENCE") || upper.contains("COMPUTER SCIENCE AND ENGINEERING")) {
            return "Department of Computer Science and Engineering";
        }
        if (upper.equals("IT") || upper.contains("INFORMATION TECH") || upper.contains("INFORMATION TECHNOLOGY")) {
            return "Department of Information Technology";
        }
        if (upper.equals("ECE") || upper.contains("ELECTRONICS AND COMMUNICATION") || upper.contains("ELECTRONICS & COMMUNICATION") || upper.contains("ELECTRONICS")) {
            return "Department of Electronics and Communication Engineering";
        }
        if (upper.equals("EEE") || upper.contains("ELECTRICAL AND ELECTRONICS") || upper.contains("ELECTRICAL & ELECTRONICS")) {
            return "Department of Electrical and Electronics Engineering";
        }
        if (upper.contains("MECH") || upper.contains("MECHANICAL")) {
            return "Department of Mechanical Engineering";
        }
        if (upper.contains("CIVIL")) {
            return "Department of Civil Engineering";
        }
        if (upper.contains("MECHATRONICS")) {
            return "Department of Mechatronics Engineering";
        }
        return dept.trim();
    }

    private String getTitleCaseDayOfWeek(LocalDate date) {
        String name = date.getDayOfWeek().name();
        return name.substring(0, 1).toUpperCase() + name.substring(1).toLowerCase();
    }

    private String formatTime(LocalTime time) {
        int hour = time.getHour(); int min = time.getMinute();
        String period = "AM";
        if (hour >= 12) { period = "PM"; if (hour > 12) hour -= 12; }
        if (hour == 0) hour = 12;
        return String.format("%d:%02d %s", hour, min, period);
    }

    private TimetableEntry findNextScheduledClass(List<TimetableEntry> entries, int currentPeriod) {
        return entries.stream()
                .filter(e -> e.getPeriod() > currentPeriod && e.getSubject() != null && !e.getSubject().trim().isEmpty())
                .min(Comparator.comparingInt(TimetableEntry::getPeriod))
                .orElse(null);
    }

    // ─── GET: Department timetable (active version, with optional semester filter) ──────────
    @GetMapping({"/department", "/department/{department}"})
    public ResponseEntity<List<TimetableEntry>> getDepartmentTimetable(
            @PathVariable(required = false) String department,
            @RequestParam(name = "department", required = false) String departmentParam,
            @RequestParam(required = false) Integer semester) {
        String deptToUse = (department != null && !department.trim().isEmpty()) ? department : departmentParam;
        if (deptToUse == null || deptToUse.trim().isEmpty()) {
            deptToUse = "Department of Computer Science and Engineering";
        }
        String normalized = normalizeDepartment(deptToUse);

        List<TimetableEntry> rawEntries = new ArrayList<>();

        if (semester != null) {
            Optional<TimetableVersion> activeVersion = timetableVersionRepository.findByDepartmentIgnoreCaseAndSemesterAndActiveTrue(normalized, semester);
            if (activeVersion.isPresent()) {
                rawEntries = timetableEntryRepository.findByVersionId(activeVersion.get().getId());
            }
            if (rawEntries.isEmpty()) {
                rawEntries = timetableEntryRepository.findByDepartmentIgnoreCaseAndSemesterAndVersionActiveTrue(normalized, semester);
            }
            if (rawEntries.isEmpty()) {
                rawEntries = timetableEntryRepository.findByDepartmentIgnoreCaseAndSemester(normalized, semester);
            }
            if (rawEntries.isEmpty()) {
                rawEntries = timetableEntryRepository.findByDepartmentIgnoreCase(normalized).stream()
                        .filter(e -> e.getSemester() != null && e.getSemester().equals(semester))
                        .collect(Collectors.toList());
            }
        } else {
            Optional<TimetableVersion> activeVersion = timetableVersionRepository.findByDepartmentIgnoreCaseAndActiveTrue(normalized);
            if (activeVersion.isPresent()) {
                rawEntries = timetableEntryRepository.findByVersionId(activeVersion.get().getId());
            } else {
                rawEntries = timetableEntryRepository.findByDepartmentIgnoreCase(normalized);
            }
        }

        // Strict filtering by normalized department and semester
        List<TimetableEntry> filtered = rawEntries.stream()
                .filter(e -> e.getDepartment() != null && normalizeDepartment(e.getDepartment()).equalsIgnoreCase(normalized))
                .filter(e -> semester == null || (e.getSemester() != null && e.getSemester().equals(semester)))
                .collect(Collectors.toList());

        System.out.println("==================================================");
        System.out.println("Selected Department: " + deptToUse + " (Normalized: " + normalized + ")");
        System.out.println("Selected Semester: " + semester);
        for (TimetableEntry e : filtered) {
            String retDept = e.getDepartment();
            Integer retSem = e.getSemester();
            String retSub = e.getSubject();
            System.out.println("Returned Department: " + retDept);
            System.out.println("Returned Semester: " + retSem);
            System.out.println("Returned Subject: " + retSub);
            if (retDept != null && !normalizeDepartment(retDept).equalsIgnoreCase(normalized)) {
                System.err.println("EXACT LINE MISMATCH: Entry ID " + e.getId() + " has department '" + retDept + "' which does not match selected '" + normalized + "'!");
            }
        }
        enrichTimetableEntries(filtered);
        return ResponseEntity.ok(filtered);
    }

    // ─── Batch request DTO ─────────────────────────────────────────────────────
    public static class BatchTimetableRequest {
        public String department;
        public Integer semester;
        public Long versionId;
        public List<EntryDto> entries;

        public static class EntryDto {
            public String dayOfWeek;
            public Integer period;
            public String subject;
            public Long facultyId;
            public Long roomId;
        }
    }

    // ─── POST: Save/update timetable batch ─────────────────────────────────────
    @PostMapping("/batch")
    @Transactional
    public ResponseEntity<?> saveTimetable(@RequestBody BatchTimetableRequest request) {
        if (request.department == null || request.department.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Department is required!");
        }
        String normalizedDept = normalizeDepartment(request.department);
        int targetSem = request.semester != null ? request.semester : 3;

        System.out.println("[SaveTimetable] Department: " + request.department + " -> Normalized: " + normalizedDept + " | Semester: " + targetSem);

        // Resolve version
        TimetableVersion version = null;
        if (request.versionId != null) {
            version = timetableVersionRepository.findById(request.versionId).orElse(null);
            if (version == null) return ResponseEntity.badRequest().body("Timetable version not found!");
        } else {
            Optional<TimetableVersion> activeVersion = timetableVersionRepository.findByDepartmentIgnoreCaseAndSemesterAndActiveTrue(normalizedDept, targetSem);
            if (activeVersion.isPresent()) {
                version = activeVersion.get();
            } else {
                Optional<TimetableVersion> deptActive = timetableVersionRepository.findByDepartmentIgnoreCaseAndActiveTrue(normalizedDept);
                version = deptActive.orElse(null);
            }
        }

        if (version == null) {
            version = timetableVersionRepository.save(TimetableVersion.builder()
                    .department(normalizedDept)
                    .semester(targetSem)
                    .academicYear("2026-2027")
                    .versionName("Active Timetable (" + normalizedDept + " Sem " + targetSem + ")")
                    .active(true)
                    .build());
        }

        timetableEntryRepository.deleteByVersionId(version.getId());

        if (request.entries != null) {
            for (BatchTimetableRequest.EntryDto dto : request.entries) {
                User faculty = dto.facultyId != null ? userRepository.findById(dto.facultyId).orElse(null) : null;
                Classroom room = dto.roomId != null ? classroomRepository.findById(dto.roomId).orElse(null) : null;
                timetableEntryRepository.save(TimetableEntry.builder()
                        .department(normalizedDept).dayOfWeek(dto.dayOfWeek).period(dto.period)
                        .subject(dto.subject).faculty(faculty).room(room)
                        .version(version).semester(targetSem).academicYear(version.getAcademicYear())
                        .build());
            }
        }
        return ResponseEntity.ok("Timetable updated successfully for " + normalizedDept + " (Semester " + targetSem + ")");
    }

    private String toTitleCaseDay(String day) {
        if (day == null || day.trim().isEmpty()) return "Monday";
        String d = day.trim();
        return d.substring(0, 1).toUpperCase() + d.substring(1).toLowerCase();
    }

    private User resolveAllocationFaculty(FacultyWorkloadAllocation alloc, List<User> allFacultyList) {
        if (alloc == null) return null;
        User fac = alloc.getFaculty();
        if (fac != null && fac.getId() != null) {
            Long targetId = fac.getId();
            User matched = allFacultyList.stream()
                    .filter(u -> u.getId() != null && u.getId().equals(targetId))
                    .findFirst()
                    .orElse(null);
            if (matched != null) return matched;
        }
        if (alloc.getFacultyName() != null && !alloc.getFacultyName().trim().isEmpty()) {
            String targetName = alloc.getFacultyName().trim().toLowerCase();
            User matched = allFacultyList.stream()
                    .filter(u -> u.getName() != null && u.getName().trim().toLowerCase().equals(targetName))
                    .findFirst()
                    .orElse(null);
            if (matched != null) return matched;
        }
        if (alloc.getFacultyEmail() != null && !alloc.getFacultyEmail().trim().isEmpty()) {
            String targetEmail = alloc.getFacultyEmail().trim().toLowerCase();
            User matched = allFacultyList.stream()
                    .filter(u -> u.getEmail() != null && u.getEmail().trim().toLowerCase().equals(targetEmail))
                    .findFirst()
                    .orElse(null);
            if (matched != null) return matched;
        }
        return fac;
    }
    public static class AutoGenerateRequest {
        public String department;
        public Integer semester;
        public String academicYear;
        public Long versionId;
    }

    @PostMapping("/auto-generate")
    @Transactional
    public ResponseEntity<?> autoGenerate(@RequestBody(required = false) AutoGenerateRequest request) {
        return generateInstitutionalTimetable(null);
    }

    /**
     * Helper method to determine if an allocation represents a Lab / Practical / Project / Workshop / Internship
     */
    private static boolean isLabOrPractical(FacultyWorkloadAllocation alloc) {
        if (alloc == null) return false;
        if (alloc.getSubject() != null && alloc.getSubject().getSubjectCategory() != null) {
            String cat = alloc.getSubject().getSubjectCategory().name().toUpperCase();
            if (cat.contains("LAB") || cat.contains("PRACTICAL") || cat.contains("PROJECT") || cat.contains("WORKSHOP") || cat.contains("INTERNSHIP")) {
                return true;
            }
        }
        String name = alloc.getSubjectName() != null ? alloc.getSubjectName().toUpperCase() : "";
        String code = alloc.getCourseCode() != null ? alloc.getCourseCode().toUpperCase() : "";

        if (name.contains("LABORATORY") || name.contains(" PRACTICAL") || name.contains(" PROJECT") || name.contains("WORKSHOP") || name.contains("INTERNSHIP") || name.endsWith(" LAB")) {
            return true;
        }
        if (code.endsWith("L") || code.contains("LAB") || code.contains("PRAC")) {
            return true;
        }
        return false;
    }

    // ─── POST: Institution-Wide Master Timetable Optimization (All Depts & All Semesters) ───
    public static class InstitutionalGenerateRequest {
        public String academicYear;
        public String semesterCycle; // "ODD" or "EVEN"
        public List<Integer> semesters;
    }

    public static class WeeklyHourViolationDetail {
        public String subjectCode;
        public String subjectName;
        public String department;
        public Integer semester;
        public String section;
        public String faculty;
        public int requiredWeeklyHours;
        public int scheduledHours;
        public int difference;
        public String reason;
    }

    public static class MissingSubjectDetail {
        public String courseCode;
        public String subjectName;
        public String subject;
        public String faculty;
        public String department;
        public Integer semester;
        public String section;
        public int requiredWeeklyHours;
        public int scheduledWeeklyHours;
        public int remainingHours;
        public String exactReason;
        public String constraintPreventingPlacement;
        public int requiredHours;
        public int hoursScheduled;
    }

    public static class CurriculumCapacityDetail {
        public String department;
        public Integer semester;
        public String section;
        public int totalRequiredHours;
        public int availableHours; // 30
        public int difference; // totalRequiredHours - 30
        public String status; // "PASS" or "Curriculum exceeds timetable capacity"
    }

    public static class FacultyWorkloadDetail {
        public Long facultyId;
        public String facultyName;
        public String department;
        public int totalScheduledHours;
        public String tierCategory; // "Preferred (12-14h)", "Soft Limit (15-16h)", "Hard Limit (17-19h)"
    }

    public static class WorkloadAlignmentDetail {
        public String facultyName;
        public String courseCode;
        public String subjectName;
        public String department;
        public Integer semester;
        public String section;
        public int requiredWeeklyHours;
        public int scheduledWeeklyHours;
        public int difference;
        public String status; // "MATCH" or "MISMATCH"
        public String constraintReason;
    }

    public static class TimetableValidationReport {
        public String academicYear;
        public String semesterCycle;
        public int departmentsGenerated;
        public List<Integer> semestersGenerated;
        public int sectionsGenerated;
        public int subjectsScheduled;
        public int facultyConflicts;
        public int classConflicts;
        public int roomConflicts;
        public int weeklyHourViolations;
        public int duplicateSubjects;
        public int missingSubjects;
        public int missingSubjectsBeforeOptimization;
        public int missingSubjectsAfterOptimization;
        public int maxFacultyWorkload;
        public boolean allSubjectsSuccessfullyScheduled;
        public long generationTimeMs;
        public String overallStatus; // "PASS", "WARNING", or "FAIL"

        // Subject Distribution & Timetable Quality Metrics
        public int consecutiveTheoryViolations;
        public int subjectsExceedingDailyLimit;
        public double multiDayDistributedPercentage;
        public double timetableQualityScore;
        public String timetableQualityRating; // "EXCELLENT", "GOOD", "NEEDS IMPROVEMENT"
        public List<String> qualityImprovementSuggestions = new ArrayList<>();

        // Faculty Daily Load Optimization Metrics
        public int consecutiveFacultyTeachingViolations;
        public int facultyDailyOverloadCount;
        public int facultyIdleGapCount;
        public double facultyWeeklyBalanceScore;
        public double facultyScheduleQualityScore;
        public String facultyScheduleQualityRating; // "EXCELLENT", "GOOD", "NEEDS IMPROVEMENT"
        public List<String> facultyScheduleImprovementSuggestions = new ArrayList<>();

        public List<WorkloadAlignmentDetail> workloadAlignmentReport = new ArrayList<>();
        public List<FacultyWorkloadDetail> facultyWithIncreasedWorkload = new ArrayList<>();
        public Map<String, Integer> facultyWorkloadDistribution = new LinkedHashMap<>();
        public List<WeeklyHourViolationDetail> weeklyHourViolationReport = new ArrayList<>();
        public List<MissingSubjectDetail> unscheduledReport = new ArrayList<>();
        public List<CurriculumCapacityDetail> curriculumCapacityReport = new ArrayList<>();
    }

    private List<FacultyWorkloadAllocation> generateFallbackWorkloadAllocations(List<Integer> targetSemesters) {
        List<SubjectMaster> subjects = subjectMasterRepository.findAll();
        List<User> facultyList = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().name().toUpperCase().contains("FACULTY"))
                .collect(Collectors.toList());

        List<FacultyWorkloadAllocation> syntheticAllocations = new ArrayList<>();
        int facIdx = 0;

        for (SubjectMaster s : subjects) {
            if (s.getSemester() != null && targetSemesters.contains(s.getSemester())) {
                User assignedFac = !facultyList.isEmpty() ? facultyList.get(facIdx % facultyList.size()) : null;
                facIdx++;

                FacultyWorkloadAllocation alloc = FacultyWorkloadAllocation.builder()
                        .department(normalizeDepartment(s.getDepartment()))
                        .semester(s.getSemester())
                        .section("A")
                        .courseCode(s.getSubjectCode())
                        .subjectName(s.getSubjectName())
                        .hoursPerWeek(s.getWeeklyHours() != null && s.getWeeklyHours() > 0 ? s.getWeeklyHours() : 3)
                        .subject(s)
                        .faculty(assignedFac)
                        .status("APPROVED")
                        .build();
                syntheticAllocations.add(alloc);
            }
        }
        return syntheticAllocations;
    }

    private TimetableValidationReport generateValidationReport(
            List<TimetableEntry> savedEntries,
            List<FacultyWorkloadAllocation> allocations,
            Map<FacultyWorkloadAllocation, Integer> scheduledHoursMap,
            String academicYear,
            String semesterCycle,
            Set<String> distinctDepts,
            List<Integer> targetSemesters,
            Set<String> distinctSections,
            long executionTimeMs,
            Set<String> facultyOccupied,
            Set<String> classOccupied,
            int missingSubjectsBeforeOpt
    ) {
        int facultyConflicts = 0;
        int classConflicts = 0;
        int roomConflicts = 0;
        int duplicateSubjects = 0;
        int weeklyHourViolations = 0;
        int missingSubjects = 0;

        Map<String, List<TimetableEntry>> facSlotMap = new HashMap<>();
        Map<String, List<TimetableEntry>> classSlotMap = new HashMap<>();
        Map<String, List<TimetableEntry>> roomSlotMap = new HashMap<>();
        Map<Long, Integer> facultyTotalHoursMap = new HashMap<>();
        Map<Long, User> facultyUserMap = new HashMap<>();

        for (TimetableEntry e : savedEntries) {
            if (e.getFaculty() != null) {
                Long fId = e.getFaculty().getId();
                facultyUserMap.put(fId, e.getFaculty());
                if (e.getSubject() != null && !e.getSubject().equalsIgnoreCase("FREE_ACTIVITY")) {
                    facultyTotalHoursMap.put(fId, facultyTotalHoursMap.getOrDefault(fId, 0) + 1);
                }
            }

            if (e.getFaculty() != null && e.getDayOfWeek() != null && e.getPeriod() != null) {
                String key = e.getFaculty().getId() + "_" + e.getDayOfWeek() + "_P" + e.getPeriod();
                facSlotMap.computeIfAbsent(key, k -> new ArrayList<>()).add(e);
            }

            if (e.getDepartment() != null && e.getSemester() != null && e.getDayOfWeek() != null && e.getPeriod() != null) {
                String sec = e.getSection() != null ? e.getSection() : "A";
                String key = normalizeDepartment(e.getDepartment()) + "_SEM" + e.getSemester() + "_SEC" + sec + "_" + e.getDayOfWeek() + "_P" + e.getPeriod();
                classSlotMap.computeIfAbsent(key, k -> new ArrayList<>()).add(e);
            }

            if (e.getRoom() != null && e.getDayOfWeek() != null && e.getPeriod() != null) {
                String key = e.getRoom().getId() + "_" + e.getDayOfWeek() + "_P" + e.getPeriod();
                roomSlotMap.computeIfAbsent(key, k -> new ArrayList<>()).add(e);
            }
        }

        for (List<TimetableEntry> list : facSlotMap.values()) {
            if (list.size() > 1) facultyConflicts += (list.size() - 1);
        }

        for (List<TimetableEntry> list : classSlotMap.values()) {
            if (list.size() > 1) classConflicts += (list.size() - 1);
        }

        for (List<TimetableEntry> list : roomSlotMap.values()) {
            if (list.size() > 1) roomConflicts += (list.size() - 1);
        }

        // ─── Calculate Curriculum Capacity per Class (Department, Semester, Section) ───
        Map<String, CurriculumCapacityDetail> capacityMap = new LinkedHashMap<>();
        for (FacultyWorkloadAllocation alloc : allocations) {
            String normDept = normalizeDepartment(alloc.getDepartment());
            int sem = alloc.getSemester() != null ? alloc.getSemester() : 3;
            String sec = alloc.getSection() != null && !alloc.getSection().trim().isEmpty() ? alloc.getSection().trim().toUpperCase() : "A";
            String classKey = normDept + "_SEM" + sem + "_SEC" + sec;
            int req = alloc.getHoursPerWeek() != null && alloc.getHoursPerWeek() > 0 ? alloc.getHoursPerWeek() : 3;

            CurriculumCapacityDetail cap = capacityMap.computeIfAbsent(classKey, k -> {
                CurriculumCapacityDetail c = new CurriculumCapacityDetail();
                c.department = normDept;
                c.semester = sem;
                c.section = sec;
                c.totalRequiredHours = 0;
                c.availableHours = 30;
                return c;
            });
            cap.totalRequiredHours += req;
        }

        for (CurriculumCapacityDetail cap : capacityMap.values()) {
            cap.difference = cap.totalRequiredHours - 30;
            if (cap.totalRequiredHours > 30) {
                cap.status = "Curriculum exceeds timetable capacity";
            } else {
                cap.status = "PASS";
            }
        }

        List<WeeklyHourViolationDetail> violationList = new ArrayList<>();
        List<MissingSubjectDetail> missingList = new ArrayList<>();
        String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"};

        for (FacultyWorkloadAllocation alloc : allocations) {
            int required = alloc.getHoursPerWeek() != null && alloc.getHoursPerWeek() > 0 ? alloc.getHoursPerWeek() : 3;
            int scheduled = scheduledHoursMap.getOrDefault(alloc, 0);

            if (scheduled != required) {
                String normDept = normalizeDepartment(alloc.getDepartment());
                int sem = alloc.getSemester() != null ? alloc.getSemester() : 3;
                String sec = alloc.getSection() != null && !alloc.getSection().trim().isEmpty() ? alloc.getSection().trim().toUpperCase() : "A";
                User fac = alloc.getFaculty();
                Long facId = fac != null ? fac.getId() : null;
                String facName = fac != null ? fac.getName() : "Unassigned";
                String subCode = alloc.getCourseCode() != null && !alloc.getCourseCode().trim().isEmpty()
                        ? alloc.getCourseCode().trim()
                        : (alloc.getSubjectName() != null ? alloc.getSubjectName().trim() : "Course");
                String subName = alloc.getSubjectName() != null ? alloc.getSubjectName() : subCode;

                int classSlotsOccupied = 0;
                int facSlotsOccupied = 0;

                for (String d : days) {
                    for (int p = 1; p <= 6; p++) {
                        String classKey = normDept + "_SEM" + sem + "_SEC" + sec + "_" + d + "_P" + p;
                        String facKey = facId != null ? (facId + "_" + d + "_P" + p) : null;

                        if (classOccupied != null && classOccupied.contains(classKey)) classSlotsOccupied++;
                        if (facKey != null && facultyOccupied != null && facultyOccupied.contains(facKey)) facSlotsOccupied++;
                    }
                }

                CurriculumCapacityDetail classCap = capacityMap.get(normDept + "_SEM" + sem + "_SEC" + sec);
                boolean curriculumOverflow = classCap != null && classCap.totalRequiredHours > 30;

                String constraintReason;
                if (curriculumOverflow) {
                    constraintReason = "Curriculum exceeds timetable capacity (" + classCap.totalRequiredHours + " required hrs > 30 available hrs/week)";
                } else if (classSlotsOccupied >= 30) {
                    constraintReason = "Class occupied (30/30 weekly slots full)";
                } else if (facId != null && facSlotsOccupied >= 30) {
                    constraintReason = "Faculty occupied across remaining free class slots";
                } else {
                    constraintReason = "Unable to Schedule – Faculty Conflict";
                }

                if (scheduled == 0) {
                    missingSubjects++;
                    MissingSubjectDetail m = new MissingSubjectDetail();
                    m.subject = subCode + " — " + subName;
                    m.faculty = facName;
                    m.department = normDept;
                    m.semester = sem;
                    m.section = sec;
                    m.requiredHours = required;
                    m.hoursScheduled = 0;
                    m.constraintPreventingPlacement = constraintReason;
                    missingList.add(m);
                } else if (scheduled < required) {
                    weeklyHourViolations++;
                    WeeklyHourViolationDetail v = new WeeklyHourViolationDetail();
                    v.subjectCode = subCode;
                    v.subjectName = subName;
                    v.department = normDept;
                    v.semester = sem;
                    v.section = sec;
                    v.faculty = facName;
                    v.requiredWeeklyHours = required;
                    v.scheduledHours = scheduled;
                    v.difference = required - scheduled;
                    v.reason = constraintReason;
                    violationList.add(v);
                }
            }
        }

        // Workload Distribution & Increased Workload Calculation
        int lightCount = 0;
        int preferredCount = 0;
        int softCount = 0;
        int hardCount = 0;
        int maxWorkload = 0;
        List<FacultyWorkloadDetail> increasedList = new ArrayList<>();

        for (Map.Entry<Long, Integer> entry : facultyTotalHoursMap.entrySet()) {
            Long fId = entry.getKey();
            int hours = entry.getValue();
            if (hours > maxWorkload) maxWorkload = hours;

            User fac = facultyUserMap.get(fId);
            String facName = fac != null ? fac.getName() : ("Faculty #" + fId);
            String facDept = fac != null ? normalizeDepartment(fac.getDepartment()) : "General";

            String tierCategory;
            if (hours < 12) {
                lightCount++;
                tierCategory = "Light (<12 hrs/wk)";
            } else if (hours <= 14) {
                preferredCount++;
                tierCategory = "Preferred (12-14 hrs/wk)";
            } else if (hours <= 16) {
                softCount++;
                tierCategory = "Soft Limit (15-16 hrs/wk)";
                FacultyWorkloadDetail detail = new FacultyWorkloadDetail();
                detail.facultyId = fId;
                detail.facultyName = facName;
                detail.department = facDept;
                detail.totalScheduledHours = hours;
                detail.tierCategory = tierCategory;
                increasedList.add(detail);
            } else {
                hardCount++;
                tierCategory = "Hard Limit (17-19 hrs/wk)";
                FacultyWorkloadDetail detail = new FacultyWorkloadDetail();
                detail.facultyId = fId;
                detail.facultyName = facName;
                detail.department = facDept;
                detail.totalScheduledHours = hours;
                detail.tierCategory = tierCategory;
                increasedList.add(detail);
            }
        }

        Map<String, Integer> workloadDistMap = new LinkedHashMap<>();
        workloadDistMap.put("Light (<12 hrs/wk)", lightCount);
        workloadDistMap.put("Preferred (12-14 hrs/wk)", preferredCount);
        workloadDistMap.put("Soft Limit (15-16 hrs/wk)", softCount);
        workloadDistMap.put("Hard Limit (17-19 hrs/wk)", hardCount);

        List<WorkloadAlignmentDetail> alignmentList = new ArrayList<>();
        for (FacultyWorkloadAllocation alloc : allocations) {
            int required = alloc.getHoursPerWeek() != null && alloc.getHoursPerWeek() > 0 ? alloc.getHoursPerWeek() : 3;
            int scheduled = scheduledHoursMap.getOrDefault(alloc, 0);

            String normDept = normalizeDepartment(alloc.getDepartment());
            int sem = alloc.getSemester() != null ? alloc.getSemester() : 3;
            String sec = alloc.getSection() != null && !alloc.getSection().trim().isEmpty() ? alloc.getSection().trim().toUpperCase() : "A";
            User fac = resolveAllocationFaculty(alloc, facultyUserMap.values().stream().toList());
            String facName = fac != null ? fac.getName() : (alloc.getFacultyName() != null ? alloc.getFacultyName() : "Unassigned");
            String subCode = alloc.getCourseCode() != null && !alloc.getCourseCode().trim().isEmpty()
                    ? alloc.getCourseCode().trim()
                    : (alloc.getSubjectName() != null ? alloc.getSubjectName().trim() : "Course");
            String subName = alloc.getSubjectName() != null ? alloc.getSubjectName() : subCode;

            WorkloadAlignmentDetail align = new WorkloadAlignmentDetail();
            align.facultyName = facName;
            align.courseCode = subCode;
            align.subjectName = subName;
            align.department = normDept;
            align.semester = sem;
            align.section = sec;
            align.requiredWeeklyHours = required;
            align.scheduledWeeklyHours = scheduled;
            align.difference = required - scheduled;
            align.status = (scheduled == required) ? "MATCH" : "MISMATCH";

            if (scheduled < required) {
                CurriculumCapacityDetail classCap = capacityMap.get(normDept + "_SEM" + sem + "_SEC" + sec);
                boolean curriculumOverflow = classCap != null && classCap.totalRequiredHours > 30;
                if (curriculumOverflow) {
                    align.constraintReason = "Curriculum exceeds timetable capacity (" + classCap.totalRequiredHours + " req > 30 available hrs/wk)";
                } else {
                    align.constraintReason = "Unable to Schedule – Faculty Conflict";
                }
            } else {
                align.constraintReason = null;
            }

            alignmentList.add(align);
        }

        // ─── Subject Distribution & Timetable Quality Analysis ───
        int consecutiveTheoryViolations = 0;
        int subjectsExceedingDailyLimit = 0;
        int multiDayDistributedCount = 0;
        int totalMultiDayCandidateCount = 0;
        List<String> qualitySuggestions = new ArrayList<>();

        Map<String, List<TimetableEntry>> classDayEntriesMap = savedEntries.stream().collect(Collectors.groupingBy(
                e -> normalizeDepartment(e.getDepartment()) + "_SEM" + e.getSemester() + "_SEC" + e.getSection() + "_" + (e.getDayOfWeek() != null ? e.getDayOfWeek().toUpperCase() : "")
        ));

        for (List<TimetableEntry> dayEntries : classDayEntriesMap.values()) {
            dayEntries.sort(Comparator.comparingInt(TimetableEntry::getPeriod));
            Map<String, Integer> subCountMap = new HashMap<>();

            for (int i = 0; i < dayEntries.size(); i++) {
                TimetableEntry curr = dayEntries.get(i);
                String sub = curr.getSubject();
                if (sub == null || sub.equalsIgnoreCase("LIBRARY_STUDY") || sub.equalsIgnoreCase("FREE_ACTIVITY") || sub.equalsIgnoreCase("FREE_HOUR")) {
                    continue;
                }
                subCountMap.put(sub, subCountMap.getOrDefault(sub, 0) + 1);

                boolean isLab = isLabOrPractical(null) || sub.toUpperCase().contains("LAB") || sub.toUpperCase().contains("PRACTICAL") || sub.toUpperCase().contains("WORKSHOP");
                if (!isLab && i >= 2) {
                    TimetableEntry prev1 = dayEntries.get(i - 1);
                    TimetableEntry prev2 = dayEntries.get(i - 2);
                    if (curr.getPeriod() == prev1.getPeriod() + 1 && prev1.getPeriod() == prev2.getPeriod() + 1
                            && sub.equalsIgnoreCase(prev1.getSubject()) && sub.equalsIgnoreCase(prev2.getSubject())) {
                        consecutiveTheoryViolations++;
                    }
                }
            }

            for (Map.Entry<String, Integer> entry : subCountMap.entrySet()) {
                String sub = entry.getKey();
                boolean isLab = sub != null && (sub.toUpperCase().contains("LAB") || sub.toUpperCase().contains("PRACTICAL") || sub.toUpperCase().contains("WORKSHOP"));
                if (!isLab && entry.getValue() > 2) {
                    subjectsExceedingDailyLimit++;
                }
            }
        }

        for (FacultyWorkloadAllocation alloc : allocations) {
            int scheduled = scheduledHoursMap.getOrDefault(alloc, 0);
            if (scheduled > 1) {
                totalMultiDayCandidateCount++;
                String normDept = normalizeDepartment(alloc.getDepartment());
                int sem = alloc.getSemester() != null ? alloc.getSemester() : 3;
                String sec = alloc.getSection() != null && !alloc.getSection().trim().isEmpty() ? alloc.getSection().trim().toUpperCase() : "A";
                String subCode = resolveDisplaySubjectCode(alloc);

                long distinctDays = savedEntries.stream()
                        .filter(e -> normalizeDepartment(e.getDepartment()).equalsIgnoreCase(normDept)
                                && e.getSemester() != null && e.getSemester() == sem
                                && e.getSection() != null && e.getSection().equalsIgnoreCase(sec)
                                && e.getSubject() != null && e.getSubject().equalsIgnoreCase(subCode))
                        .map(TimetableEntry::getDayOfWeek)
                        .distinct()
                        .count();

                if (distinctDays >= 2) {
                    multiDayDistributedCount++;
                }
            }
        }

        double multiDayPct = totalMultiDayCandidateCount > 0 ? (multiDayDistributedCount * 100.0 / totalMultiDayCandidateCount) : 100.0;
        int totalClassesEvaluated = Math.max(1, classDayEntriesMap.size() / 5);
        double avgTheoryViolationsPerClass = (double) consecutiveTheoryViolations / totalClassesEvaluated;
        double avgExceedingDailyPerClass = (double) subjectsExceedingDailyLimit / totalClassesEvaluated;
        double qualityScore = (multiDayPct * 0.6) + Math.max(0.0, 40.0 - (avgTheoryViolationsPerClass * 10.0) - (avgExceedingDailyPerClass * 5.0));
        qualityScore = Math.max(0.0, Math.min(100.0, qualityScore));

        String rating = qualityScore >= 90.0 ? "EXCELLENT" : (qualityScore >= 75.0 ? "GOOD" : "NEEDS IMPROVEMENT");

        if (consecutiveTheoryViolations == 0 && subjectsExceedingDailyLimit == 0 && multiDayPct >= 90.0) {
            qualitySuggestions.add("Timetable achieves optimal subject distribution and zero consecutive theory violations across all class sections.");
        } else {
            if (consecutiveTheoryViolations > 0) {
                qualitySuggestions.add(consecutiveTheoryViolations + " consecutive theory period clusters detected. Consider re-spacing theory lectures across free periods.");
            }
            if (subjectsExceedingDailyLimit > 0) {
                qualitySuggestions.add(subjectsExceedingDailyLimit + " subjects exceed 2 periods per day limit. Spread excess periods across available days.");
            }
            if (multiDayPct < 90.0) {
                qualitySuggestions.add(String.format("Multi-day subject distribution is currently at %.1f%%. Encourage 3-day or 4-day spreading for core subjects.", multiDayPct));
            }
        }

        // ─── Faculty Daily Load & Schedule Quality Analysis ───
        int consecutiveFacultyTeachingViolations = 0;
        int facultyDailyOverloadCount = 0;
        int facultyIdleGapCount = 0;
        int facultyWellBalancedCount = 0;
        int totalFacultyEvaluatedCount = 0;
        List<String> facultyScheduleSuggestions = new ArrayList<>();

        Map<Long, Map<String, List<Integer>>> facultyDayPeriodsMap = new HashMap<>();
        for (TimetableEntry e : savedEntries) {
            if (e.getFaculty() != null && e.getDayOfWeek() != null) {
                Long fId = e.getFaculty().getId();
                String day = e.getDayOfWeek().toUpperCase();
                facultyDayPeriodsMap
                        .computeIfAbsent(fId, k -> new HashMap<>())
                        .computeIfAbsent(day, k -> new ArrayList<>())
                        .add(e.getPeriod());
            }
        }

        for (Map.Entry<Long, Map<String, List<Integer>>> fEntry : facultyDayPeriodsMap.entrySet()) {
            totalFacultyEvaluatedCount++;
            Map<String, List<Integer>> dayMap = fEntry.getValue();
            List<Integer> dailyCounts = new ArrayList<>();

            for (List<Integer> periods : dayMap.values()) {
                Collections.sort(periods);
                int dayCount = periods.size();
                dailyCounts.add(dayCount);

                if (dayCount > 4) {
                    facultyDailyOverloadCount++;
                }

                for (int i = 0; i < periods.size(); i++) {
                    int p = periods.get(i);
                    if (i >= 2 && p == periods.get(i - 1) + 1 && periods.get(i - 1) == periods.get(i - 2) + 1) {
                        consecutiveFacultyTeachingViolations++;
                    }
                    if (periods.contains(p + 2) && !periods.contains(p + 1)) {
                        facultyIdleGapCount++;
                    }
                }
            }

            int minD = dailyCounts.stream().min(Integer::compare).orElse(0);
            int maxD = dailyCounts.stream().max(Integer::compare).orElse(0);
            if (maxD - minD <= 2) {
                facultyWellBalancedCount++;
            }
        }

        double facultyWeeklyBalanceScore = totalFacultyEvaluatedCount > 0 ? (facultyWellBalancedCount * 100.0 / totalFacultyEvaluatedCount) : 100.0;
        double avgGapsPerFaculty = totalFacultyEvaluatedCount > 0 ? ((double) facultyIdleGapCount / totalFacultyEvaluatedCount) : 0.0;
        double avgConsecutiveViolations = totalFacultyEvaluatedCount > 0 ? ((double) consecutiveFacultyTeachingViolations / totalFacultyEvaluatedCount) : 0.0;
        double avgOverloadPerFaculty = totalFacultyEvaluatedCount > 0 ? ((double) facultyDailyOverloadCount / totalFacultyEvaluatedCount) : 0.0;
        double facultyQualityScore = 100.0 - (avgConsecutiveViolations * 15.0) - (avgOverloadPerFaculty * 15.0) - (avgGapsPerFaculty * 10.0);
        facultyQualityScore = Math.max(0.0, Math.min(100.0, facultyQualityScore));

        String facultyRating = facultyQualityScore >= 90.0 ? "EXCELLENT" : (facultyQualityScore >= 75.0 ? "GOOD" : "NEEDS IMPROVEMENT");

        if (consecutiveFacultyTeachingViolations == 0 && facultyDailyOverloadCount == 0 && facultyIdleGapCount == 0) {
            facultyScheduleSuggestions.add("Faculty schedules achieve optimal daily load balance, zero long consecutive blocks, and zero idle gaps.");
        } else {
            if (consecutiveFacultyTeachingViolations > 0) {
                facultyScheduleSuggestions.add(consecutiveFacultyTeachingViolations + " long consecutive faculty teaching blocks (>2 periods) detected. Consider re-spacing across free periods.");
            }
            if (facultyDailyOverloadCount > 0) {
                facultyScheduleSuggestions.add(facultyDailyOverloadCount + " faculty days exceed the 4 periods/day limit.");
            }
            if (facultyIdleGapCount > 0) {
                facultyScheduleSuggestions.add(facultyIdleGapCount + " isolated idle waiting gaps detected in faculty daily schedules.");
            }
        }

        TimetableValidationReport report = new TimetableValidationReport();
        report.academicYear = academicYear;
        report.semesterCycle = semesterCycle;
        report.departmentsGenerated = distinctDepts.size();
        report.semestersGenerated = targetSemesters;
        report.sectionsGenerated = distinctSections.isEmpty() ? 1 : distinctSections.size();
        report.subjectsScheduled = savedEntries.size();
        report.facultyConflicts = facultyConflicts;
        report.classConflicts = classConflicts;
        report.roomConflicts = roomConflicts;
        report.weeklyHourViolations = weeklyHourViolations;
        report.duplicateSubjects = duplicateSubjects;
        report.missingSubjects = missingSubjects;
        report.missingSubjectsBeforeOptimization = missingSubjectsBeforeOpt;
        report.missingSubjectsAfterOptimization = missingSubjects;
        report.maxFacultyWorkload = maxWorkload;
        report.allSubjectsSuccessfullyScheduled = (missingSubjects == 0 && weeklyHourViolations == 0);
        report.generationTimeMs = executionTimeMs;
        report.facultyWorkloadDistribution = workloadDistMap;
        report.facultyWithIncreasedWorkload = increasedList;
        report.workloadAlignmentReport = alignmentList;

        // Populate Subject Distribution Analysis
        report.consecutiveTheoryViolations = consecutiveTheoryViolations;
        report.subjectsExceedingDailyLimit = subjectsExceedingDailyLimit;
        report.multiDayDistributedPercentage = Math.round(multiDayPct * 10.0) / 10.0;
        report.timetableQualityScore = Math.round(qualityScore * 10.0) / 10.0;
        report.timetableQualityRating = rating;
        report.qualityImprovementSuggestions = qualitySuggestions;

        // Populate Faculty Schedule Optimization Analysis
        report.consecutiveFacultyTeachingViolations = consecutiveFacultyTeachingViolations;
        report.facultyDailyOverloadCount = facultyDailyOverloadCount;
        report.facultyIdleGapCount = facultyIdleGapCount;
        report.facultyWeeklyBalanceScore = Math.round(facultyWeeklyBalanceScore * 10.0) / 10.0;
        report.facultyScheduleQualityScore = Math.round(facultyQualityScore * 10.0) / 10.0;
        report.facultyScheduleQualityRating = facultyRating;
        report.facultyScheduleImprovementSuggestions = facultyScheduleSuggestions;

        if (facultyConflicts > 0 || classConflicts > 0 || roomConflicts > 0) {
            report.overallStatus = "FAIL";
        } else if (missingSubjects > 0 || weeklyHourViolations > 0) {
            report.overallStatus = "WARNING";
        } else {
            report.overallStatus = "PASS";
        }

        report.weeklyHourViolationReport = violationList;
        report.unscheduledReport = missingList;
        report.curriculumCapacityReport = new ArrayList<>(capacityMap.values());

        return report;
    }

    @PostMapping("/generate-institutional")
    @Transactional
    public ResponseEntity<?> generateInstitutionalTimetable(@RequestBody(required = false) InstitutionalGenerateRequest request) {
        long startTime = System.currentTimeMillis();

        String academicYear = (request != null && request.academicYear != null && !request.academicYear.trim().isEmpty())
                ? request.academicYear.trim() : "2026-2027";

        String semesterCycle = (request != null && request.semesterCycle != null && !request.semesterCycle.trim().isEmpty())
                ? request.semesterCycle.trim().toUpperCase() : "ODD";

        List<Integer> targetSemesters;
        if ("EVEN".equalsIgnoreCase(semesterCycle)) {
            targetSemesters = List.of(2, 4, 6, 8, 10);
        } else {
            targetSemesters = List.of(1, 3, 5, 7, 9);
        }
        if (request != null && request.semesters != null && !request.semesters.isEmpty()) {
            targetSemesters = request.semesters;
        }

        System.out.println("[MasterTimetable] Selected Academic Year: " + academicYear + " | Cycle: " + semesterCycle + " | Target Semesters: " + targetSemesters);

        List<FacultyWorkloadAllocation> allAllocations = facultyWorkloadAllocationRepository.findByStatus("APPROVED");
        if (allAllocations.isEmpty()) {
            allAllocations = facultyWorkloadAllocationRepository.findAll();
        }

        final List<Integer> semsToMatch = targetSemesters;
        List<FacultyWorkloadAllocation> filteredAllocations = allAllocations.stream()
                .filter(a -> a.getSemester() != null && semsToMatch.contains(a.getSemester()))
                .collect(Collectors.toList());

        if (filteredAllocations.isEmpty()) {
            filteredAllocations = generateFallbackWorkloadAllocations(semsToMatch);
        }

        // Deduplicate allocations by (department, semester, section, courseCode) to avoid duplicate database allocations
        Map<String, FacultyWorkloadAllocation> uniqueAllocMap = new LinkedHashMap<>();
        for (FacultyWorkloadAllocation a : filteredAllocations) {
            String normDept = normalizeDepartment(a.getDepartment());
            int sem = a.getSemester() != null ? a.getSemester() : 3;
            String sec = a.getSection() != null && !a.getSection().trim().isEmpty() ? a.getSection().trim().toUpperCase() : "A";
            String subCode = resolveDisplaySubjectCode(a);
            String key = normDept + "_SEM" + sem + "_SEC" + sec + "_" + subCode;
            uniqueAllocMap.put(key, a);
        }
        filteredAllocations = new ArrayList<>(uniqueAllocMap.values());

        if (filteredAllocations.isEmpty()) {
            return ResponseEntity.badRequest().body("No subjects or workload allocations found for semester cycle " + semesterCycle + ". Please add subjects or generate workload allocations first.");
        }

        List<Classroom> classrooms = classroomRepository.findAll();

        // Global Occupancy Maps
        Set<String> facultyOccupied = new HashSet<>(); // facId + "_" + day + "_P" + period
        Set<String> classOccupied = new HashSet<>();   // normDept + "_SEM" + sem + "_SEC" + sec + "_" + day + "_P" + period
        Set<String> roomOccupied = new HashSet<>();    // roomId + "_" + day + "_P" + period

        String[] days = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"};

        Map<String, TimetableVersion> versionMap = new HashMap<>();
        Set<String> distinctDepts = new HashSet<>();
        Set<String> distinctSections = new HashSet<>();

        for (FacultyWorkloadAllocation a : filteredAllocations) {
            String normDept = normalizeDepartment(a.getDepartment());
            int sem = a.getSemester() != null ? a.getSemester() : 3;
            String sec = a.getSection() != null && !a.getSection().trim().isEmpty() ? a.getSection().trim().toUpperCase() : "A";
            distinctDepts.add(normDept);
            distinctSections.add(sec);

            String versionKey = normDept + "_" + sem;
            if (!versionMap.containsKey(versionKey)) {
                List<TimetableVersion> allOldVersions = timetableVersionRepository.findAll().stream()
                        .filter(v -> v.getSemester() != null && v.getSemester().equals(sem) && v.isActive())
                        .filter(v -> normalizeDepartment(v.getDepartment()).equalsIgnoreCase(normDept))
                        .collect(Collectors.toList());

                for (TimetableVersion oldV : allOldVersions) {
                    oldV.setActive(false);
                    timetableVersionRepository.save(oldV);
                    timetableEntryRepository.deleteByVersionId(oldV.getId());
                }

                TimetableVersion version = timetableVersionRepository.save(TimetableVersion.builder()
                        .department(normDept)
                        .semester(sem)
                        .academicYear(academicYear)
                        .versionName("Master Timetable (" + semesterCycle + " " + academicYear + " - " + normDept + " Sem " + sem + ")")
                        .active(true)
                        .build());

                versionMap.put(versionKey, version);
            }
        }

        // Pre-populate faculty and room occupancy from active versions not being replaced
        Set<Long> replacedVersionIds = versionMap.values().stream().map(TimetableVersion::getId).collect(Collectors.toSet());
        List<TimetableEntry> existingActiveEntries = timetableEntryRepository.findAll().stream()
                .filter(e -> e.getVersion() != null && e.getVersion().isActive())
                .filter(e -> !replacedVersionIds.contains(e.getVersion().getId()))
                .collect(Collectors.toList());

        for (TimetableEntry e : existingActiveEntries) {
            if (e.getFaculty() != null && e.getDayOfWeek() != null) {
                facultyOccupied.add(e.getFaculty().getId() + "_" + e.getDayOfWeek().toUpperCase() + "_P" + e.getPeriod());
            }
            if (e.getRoom() != null && e.getDayOfWeek() != null) {
                roomOccupied.add(e.getRoom().getId() + "_" + e.getDayOfWeek().toUpperCase() + "_P" + e.getPeriod());
            }
        }

        // Global Difficulty Sorting: Labs & Practicals first, then theory descending by required hours
        List<FacultyWorkloadAllocation> labAllocations = filteredAllocations.stream()
                .filter(a -> isLabOrPractical(a))
                .sorted((a1, a2) -> Integer.compare(
                        a2.getHoursPerWeek() != null ? a2.getHoursPerWeek() : 2,
                        a1.getHoursPerWeek() != null ? a1.getHoursPerWeek() : 2))
                .collect(Collectors.toList());

        List<FacultyWorkloadAllocation> theoryAllocations = filteredAllocations.stream()
                .filter(a -> !isLabOrPractical(a))
                .sorted((a1, a2) -> Integer.compare(
                        a2.getHoursPerWeek() != null ? a2.getHoursPerWeek() : 3,
                        a1.getHoursPerWeek() != null ? a1.getHoursPerWeek() : 3))
                .collect(Collectors.toList());

        List<User> allFacultyList = userRepository.findByRole(Role.FACULTY);

        List<TimetableEntry> entriesToSave = new ArrayList<>();
        Map<FacultyWorkloadAllocation, Integer> scheduledHoursMap = new HashMap<>();
        Map<Long, Integer> facultyTotalHoursMap = new HashMap<>();

        // Workload Priority Tiers (Final Plan Specs)
        final int PREFERRED_LIMIT = 17;
        final int SOFT_LIMIT = 18;
        final int HARD_LIMIT = 19;

        // ─── PASS 1: Schedule Lab / Practical Consecutive Blocks Globally ───
        for (FacultyWorkloadAllocation alloc : labAllocations) {
            User fac = resolveAllocationFaculty(alloc, allFacultyList);
            Long facId = fac != null ? fac.getId() : null;
            String normDept = normalizeDepartment(alloc.getDepartment());
            int sem = alloc.getSemester() != null ? alloc.getSemester() : 3;
            String section = alloc.getSection() != null && !alloc.getSection().trim().isEmpty() ? alloc.getSection().trim().toUpperCase() : "A";
            int requiredHours = alloc.getHoursPerWeek() != null && alloc.getHoursPerWeek() > 0 ? alloc.getHoursPerWeek() : 2;
            int blockSize = Math.min(requiredHours, 2);
            int hoursScheduled = 0;
            String subCode = resolveDisplaySubjectCode(alloc);

            TimetableVersion version = versionMap.get(normDept + "_" + sem);

            for (String day : days) {
                if (hoursScheduled >= requiredHours) break;

                for (int p = 1; p <= 6 - blockSize + 1; p += 2) {
                    if (hoursScheduled >= requiredHours) break;

                    Classroom assignedRoom = null;
                    for (Classroom c : classrooms) {
                        if (c.getRoomType() != null && (c.getRoomType().toUpperCase().contains("LAB") || c.getRoomType().toUpperCase().contains("PRACTICAL"))) {
                            boolean rFree = true;
                            for (int offset = 0; offset < blockSize; offset++) {
                                if (roomOccupied.contains(c.getId() + "_" + day + "_P" + (p + offset))) {
                                    rFree = false;
                                    break;
                                }
                            }
                            if (rFree) { assignedRoom = c; break; }
                        }
                    }

                    boolean available = true;
                    for (int offset = 0; offset < blockSize; offset++) {
                        int period = p + offset;
                        String facKey = facId != null ? (facId + "_" + day + "_P" + period) : null;
                        String classKey = normDept + "_SEM" + sem + "_SEC" + section + "_" + day + "_P" + period;

                        if ((facKey != null && facultyOccupied.contains(facKey)) || classOccupied.contains(classKey)) {
                            available = false;
                            break;
                        }
                    }

                    if (available) {
                        for (int offset = 0; offset < blockSize; offset++) {
                            int period = p + offset;
                            String facKey = facId != null ? (facId + "_" + day + "_P" + period) : null;
                            String classKey = normDept + "_SEM" + sem + "_SEC" + section + "_" + day + "_P" + period;

                            if (facKey != null) facultyOccupied.add(facKey);
                            classOccupied.add(classKey);
                            if (assignedRoom != null) roomOccupied.add(assignedRoom.getId() + "_" + day + "_P" + period);
                            if (facId != null) facultyTotalHoursMap.put(facId, facultyTotalHoursMap.getOrDefault(facId, 0) + 1);

                            entriesToSave.add(TimetableEntry.builder()
                                    .department(normDept)
                                    .dayOfWeek(toTitleCaseDay(day))
                                    .period(period)
                                    .subject(subCode)
                                    .faculty(fac)
                                    .room(assignedRoom)
                                    .version(version)
                                    .semester(sem)
                                    .section(section)
                                    .academicYear(academicYear)
                                    .build());

                            hoursScheduled++;
                        }
                        break; // Spread multi-block practicals across separate days
                    }
                }
            }
            scheduledHoursMap.put(alloc, hoursScheduled);
        }

        // ─── MULTI-TIER THEORY SCHEDULING (Preferred -> Soft Limit -> Hard Limit) ───
        Map<String, Integer> subjectDayHours = new HashMap<>(); // normDept_sem_sec_day_subCode -> count
        Map<FacultyWorkloadAllocation, Integer> unscheduledTheoryMap = new HashMap<>();

        for (FacultyWorkloadAllocation alloc : theoryAllocations) {
            int req = alloc.getHoursPerWeek() != null && alloc.getHoursPerWeek() > 0 ? alloc.getHoursPerWeek() : 3;
            unscheduledTheoryMap.put(alloc, req);
            scheduledHoursMap.put(alloc, 0);
        }

        Map<Long, Integer> facultyApprovedTotalMap = new HashMap<>();
        for (FacultyWorkloadAllocation a : filteredAllocations) {
            User fac = resolveAllocationFaculty(a, allFacultyList);
            if (fac != null && a.getHoursPerWeek() != null && a.getHoursPerWeek() > 0) {
                facultyApprovedTotalMap.put(fac.getId(), facultyApprovedTotalMap.getOrDefault(fac.getId(), 0) + a.getHoursPerWeek());
            }
        }

        // Helper lambda: Pick strictly assigned faculty from FacultyWorkloadAllocation (NO REPLACEMENT)
        java.util.function.BiFunction<FacultyWorkloadAllocation, String, User> findLowestWorkloadFaculty = (alloc, dayPeriodKey) -> {
            User primaryFac = resolveAllocationFaculty(alloc, allFacultyList);
            if (primaryFac != null) {
                String pFacKey = primaryFac.getId() + "_" + dayPeriodKey;
                int approvedTotal = facultyApprovedTotalMap.getOrDefault(primaryFac.getId(), HARD_LIMIT);
                int effectiveLimit = Math.max(HARD_LIMIT, approvedTotal);
                if (!facultyOccupied.contains(pFacKey) && facultyTotalHoursMap.getOrDefault(primaryFac.getId(), 0) < effectiveLimit) {
                    return primaryFac;
                }
            }
            // Strict enforcement: NEVER replace the assigned faculty with another faculty
            return null;
        };

        // ─── PASS 2: Tier 1 (Preferred Workload Limit <= 17 hrs/week) ───
        for (int pass = 1; pass <= 4; pass++) {
            for (FacultyWorkloadAllocation alloc : theoryAllocations) {
                int remaining = unscheduledTheoryMap.getOrDefault(alloc, 0);
                if (remaining <= 0) continue;

                String normDept = normalizeDepartment(alloc.getDepartment());
                int sem = alloc.getSemester() != null ? alloc.getSemester() : 3;
                String section = alloc.getSection() != null && !alloc.getSection().trim().isEmpty() ? alloc.getSection().trim().toUpperCase() : "A";
                String subCode = resolveDisplaySubjectCode(alloc);

                TimetableVersion version = versionMap.get(normDept + "_" + sem);

                // Collect candidate (day, period) slots with subject distribution scoring
                TheoryCandidateSlot bestSlot = null;

                int maxDailyCapForPass = (pass <= 2) ? 1 : 2;

                for (String day : days) {
                    if (unscheduledTheoryMap.getOrDefault(alloc, 0) <= 0) break;

                    String daySubKey = normDept + "_" + sem + "_" + section + "_" + day + "_" + subCode;
                    int currentDayCount = subjectDayHours.getOrDefault(daySubKey, 0);
                    if (currentDayCount >= maxDailyCapForPass) continue;

                    for (int p = 1; p <= 6; p++) {
                        String classKey = normDept + "_SEM" + sem + "_SEC" + section + "_" + day + "_P" + p;
                        if (classOccupied.contains(classKey)) continue;

                        User selectedFac = findLowestWorkloadFaculty.apply(alloc, day + "_P" + p);
                        if (selectedFac == null) continue;
                        Long selectedFacId = selectedFac.getId();
                        int currentFacWorkload = facultyTotalHoursMap.getOrDefault(selectedFacId, 0);

                        int approvedTotal = selectedFacId != null ? facultyApprovedTotalMap.getOrDefault(selectedFacId, PREFERRED_LIMIT) : PREFERRED_LIMIT;
                        if (selectedFacId != null && currentFacWorkload >= Math.max(PREFERRED_LIMIT, approvedTotal)) continue;

                        String facKey = selectedFacId != null ? (selectedFacId + "_" + day + "_P" + p) : null;
                        if (facKey != null && facultyOccupied.contains(facKey)) continue;

                        // Check adjacent period assignments for same subject to prevent >2 consecutive periods
                        boolean prev1 = isTheorySubjectAt(entriesToSave, normDept, sem, section, day, p - 1, subCode);
                        boolean prev2 = isTheorySubjectAt(entriesToSave, normDept, sem, section, day, p - 2, subCode);
                        boolean next1 = isTheorySubjectAt(entriesToSave, normDept, sem, section, day, p + 1, subCode);
                        boolean next2 = isTheorySubjectAt(entriesToSave, normDept, sem, section, day, p + 2, subCode);

                        // HARD CONSTRAINT: Prevent 3+ consecutive periods of the same theory subject
                        if ((prev1 && prev2) || (next1 && next2) || (prev1 && next1)) {
                            continue;
                        }

                        Classroom assignedRoom = null;
                        for (Classroom c : classrooms) {
                            String rKey = c.getId() + "_" + day + "_P" + p;
                            if (!roomOccupied.contains(rKey)) {
                                assignedRoom = c;
                                break;
                            }
                        }

                        // Subject Distribution Candidate Scoring
                        int score = 100;
                        if (currentDayCount == 0) score += 40; // Reward multi-day spreading
                        if (!prev1 && !next1) score += 30; // Reward isolated/interleaved spacing
                        if (prev1 || next1) score -= 15;  // Slight penalty for 2 consecutive

                        // Faculty Schedule Contiguity & Gap Compression Scoring
                        if (selectedFacId != null) {
                            boolean facHasPrev1 = facultyOccupied.contains(selectedFacId + "_" + day + "_P" + (p - 1));
                            boolean facHasNext1 = facultyOccupied.contains(selectedFacId + "_" + day + "_P" + (p + 1));
                            boolean facHasPrev2 = facultyOccupied.contains(selectedFacId + "_" + day + "_P" + (p - 2));
                            boolean facHasNext2 = facultyOccupied.contains(selectedFacId + "_" + day + "_P" + (p + 2));

                            if (facHasPrev1 || facHasNext1) {
                                score += 45; // Clustered contiguous teaching block
                            } else if (facHasPrev2 || facHasNext2) {
                                score -= 25; // Avoid isolated 1-period idle waiting gap
                            }
                        }

                        if (bestSlot == null || score > bestSlot.score) {
                            bestSlot = new TheoryCandidateSlot(day, p, selectedFac, assignedRoom, score);
                        }
                    }
                }

                if (bestSlot != null) {
                    String day = bestSlot.day;
                    int p = bestSlot.period;
                    User selectedFac = bestSlot.selectedFac;
                    Classroom assignedRoom = bestSlot.assignedRoom;
                    Long selectedFacId = selectedFac != null ? selectedFac.getId() : null;

                    String facKey = selectedFacId != null ? (selectedFacId + "_" + day + "_P" + p) : null;
                    String classKey = normDept + "_SEM" + sem + "_SEC" + section + "_" + day + "_P" + p;

                    if (facKey != null) facultyOccupied.add(facKey);
                    classOccupied.add(classKey);
                    if (assignedRoom != null) roomOccupied.add(assignedRoom.getId() + "_" + day + "_P" + p);
                    if (selectedFacId != null) facultyTotalHoursMap.put(selectedFacId, facultyTotalHoursMap.getOrDefault(selectedFacId, 0) + 1);

                    entriesToSave.add(TimetableEntry.builder()
                            .department(normDept)
                            .dayOfWeek(toTitleCaseDay(day))
                            .period(p)
                            .subject(subCode)
                            .faculty(selectedFac)
                            .room(assignedRoom)
                            .version(version)
                            .semester(sem)
                            .section(section)
                            .academicYear(academicYear)
                            .build());

                    String daySubKey = normDept + "_" + sem + "_" + section + "_" + day + "_" + subCode;
                    subjectDayHours.put(daySubKey, subjectDayHours.getOrDefault(daySubKey, 0) + 1);
                    unscheduledTheoryMap.put(alloc, unscheduledTheoryMap.get(alloc) - 1);
                    scheduledHoursMap.put(alloc, scheduledHoursMap.get(alloc) + 1);
                }
            }
        }

        // Count missing subjects before Tier 2/3 dynamic expansion
        int missingSubjectsBeforeOptimization = (int) theoryAllocations.stream()
                .filter(alloc -> scheduledHoursMap.getOrDefault(alloc, 0) == 0)
                .count();

        // ─── PASS 3: Tier 2 Escalation (Soft Limit <= 16 hrs/week) ───
        for (FacultyWorkloadAllocation alloc : theoryAllocations) {
            int remaining = unscheduledTheoryMap.getOrDefault(alloc, 0);
            if (remaining <= 0) continue;

            String normDept = normalizeDepartment(alloc.getDepartment());
            int sem = alloc.getSemester() != null ? alloc.getSemester() : 3;
            String section = alloc.getSection() != null && !alloc.getSection().trim().isEmpty() ? alloc.getSection().trim().toUpperCase() : "A";
            String subCode = resolveDisplaySubjectCode(alloc);

            TimetableVersion version = versionMap.get(normDept + "_" + sem);

            TheoryCandidateSlot bestSlot = null;

            for (String day : days) {
                if (unscheduledTheoryMap.getOrDefault(alloc, 0) <= 0) break;

                String daySubKey = normDept + "_" + sem + "_" + section + "_" + day + "_" + subCode;
                int currentDayCount = subjectDayHours.getOrDefault(daySubKey, 0);
                if (currentDayCount >= 2) continue;

                for (int p = 1; p <= 6; p++) {
                    String classKey = normDept + "_SEM" + sem + "_SEC" + section + "_" + day + "_P" + p;
                    if (classOccupied.contains(classKey)) continue;

                    User selectedFac = findLowestWorkloadFaculty.apply(alloc, day + "_P" + p);
                    if (selectedFac == null) continue;
                    Long selectedFacId = selectedFac.getId();
                    int currentFacWorkload = facultyTotalHoursMap.getOrDefault(selectedFacId, 0);

                    int approvedTotal = selectedFacId != null ? facultyApprovedTotalMap.getOrDefault(selectedFacId, SOFT_LIMIT) : SOFT_LIMIT;
                    if (selectedFacId != null && currentFacWorkload >= Math.max(SOFT_LIMIT, approvedTotal)) continue;

                    String facKey = selectedFacId != null ? (selectedFacId + "_" + day + "_P" + p) : null;
                    if (facKey != null && facultyOccupied.contains(facKey)) continue;

                    boolean prev1 = isTheorySubjectAt(entriesToSave, normDept, sem, section, day, p - 1, subCode);
                    boolean prev2 = isTheorySubjectAt(entriesToSave, normDept, sem, section, day, p - 2, subCode);
                    boolean next1 = isTheorySubjectAt(entriesToSave, normDept, sem, section, day, p + 1, subCode);
                    boolean next2 = isTheorySubjectAt(entriesToSave, normDept, sem, section, day, p + 2, subCode);

                    if ((prev1 && prev2) || (next1 && next2) || (prev1 && next1)) continue;

                    Classroom assignedRoom = null;
                    for (Classroom c : classrooms) {
                        String rKey = c.getId() + "_" + day + "_P" + p;
                        if (!roomOccupied.contains(rKey)) {
                            assignedRoom = c;
                            break;
                        }
                    }

                    int score = 100;
                    if (currentDayCount == 0) score += 40;
                    if (!prev1 && !next1) score += 30;
                    if (prev1 || next1) score -= 15;

                    // Faculty Schedule Contiguity & Gap Compression Scoring
                    if (selectedFacId != null) {
                        boolean facHasPrev1 = facultyOccupied.contains(selectedFacId + "_" + day + "_P" + (p - 1));
                        boolean facHasNext1 = facultyOccupied.contains(selectedFacId + "_" + day + "_P" + (p + 1));
                        boolean facHasPrev2 = facultyOccupied.contains(selectedFacId + "_" + day + "_P" + (p - 2));
                        boolean facHasNext2 = facultyOccupied.contains(selectedFacId + "_" + day + "_P" + (p + 2));

                        if (facHasPrev1 || facHasNext1) {
                            score += 45;
                        } else if (facHasPrev2 || facHasNext2) {
                            score -= 25;
                        }
                    }

                    if (bestSlot == null || score > bestSlot.score) {
                        bestSlot = new TheoryCandidateSlot(day, p, selectedFac, assignedRoom, score);
                    }
                }
            }

            if (bestSlot != null) {
                String day = bestSlot.day;
                int p = bestSlot.period;
                User selectedFac = bestSlot.selectedFac;
                Classroom assignedRoom = bestSlot.assignedRoom;
                Long selectedFacId = selectedFac != null ? selectedFac.getId() : null;

                String facKey = selectedFacId != null ? (selectedFacId + "_" + day + "_P" + p) : null;
                String classKey = normDept + "_SEM" + sem + "_SEC" + section + "_" + day + "_P" + p;

                if (facKey != null) facultyOccupied.add(facKey);
                classOccupied.add(classKey);
                if (assignedRoom != null) roomOccupied.add(assignedRoom.getId() + "_" + day + "_P" + p);
                if (selectedFacId != null) facultyTotalHoursMap.put(selectedFacId, facultyTotalHoursMap.getOrDefault(selectedFacId, 0) + 1);

                entriesToSave.add(TimetableEntry.builder()
                        .department(normDept)
                        .dayOfWeek(toTitleCaseDay(day))
                        .period(p)
                        .subject(subCode)
                        .faculty(selectedFac)
                        .room(assignedRoom)
                        .version(version)
                        .semester(sem)
                        .section(section)
                        .academicYear(academicYear)
                        .build());

                String daySubKey = normDept + "_" + sem + "_" + section + "_" + day + "_" + subCode;
                subjectDayHours.put(daySubKey, subjectDayHours.getOrDefault(daySubKey, 0) + 1);
                unscheduledTheoryMap.put(alloc, unscheduledTheoryMap.get(alloc) - 1);
                scheduledHoursMap.put(alloc, scheduledHoursMap.get(alloc) + 1);
            }
        }

        // ─── PASS 4: Tier 3 Escalation (Hard Limit <= 19 hrs/week) ───
        for (FacultyWorkloadAllocation alloc : theoryAllocations) {
            int remaining = unscheduledTheoryMap.getOrDefault(alloc, 0);
            if (remaining <= 0) continue;

            String normDept = normalizeDepartment(alloc.getDepartment());
            int sem = alloc.getSemester() != null ? alloc.getSemester() : 3;
            String section = alloc.getSection() != null && !alloc.getSection().trim().isEmpty() ? alloc.getSection().trim().toUpperCase() : "A";
            String subCode = resolveDisplaySubjectCode(alloc);

            TimetableVersion version = versionMap.get(normDept + "_" + sem);

            TheoryCandidateSlot bestSlot = null;

            for (String day : days) {
                if (unscheduledTheoryMap.getOrDefault(alloc, 0) <= 0) break;

                String daySubKey = normDept + "_" + sem + "_" + section + "_" + day + "_" + subCode;
                int currentDayCount = subjectDayHours.getOrDefault(daySubKey, 0);
                if (currentDayCount >= 2) continue;

                for (int p = 1; p <= 6; p++) {
                    String classKey = normDept + "_SEM" + sem + "_SEC" + section + "_" + day + "_P" + p;
                    if (classOccupied.contains(classKey)) continue;

                    User selectedFac = findLowestWorkloadFaculty.apply(alloc, day + "_P" + p);
                    if (selectedFac == null) continue;
                    Long selectedFacId = selectedFac.getId();
                    int currentFacWorkload = facultyTotalHoursMap.getOrDefault(selectedFacId, 0);

                    int approvedTotal = selectedFacId != null ? facultyApprovedTotalMap.getOrDefault(selectedFacId, HARD_LIMIT) : HARD_LIMIT;
                    if (selectedFacId != null && currentFacWorkload >= Math.max(HARD_LIMIT, approvedTotal)) continue;

                    String facKey = selectedFacId != null ? (selectedFacId + "_" + day + "_P" + p) : null;
                    if (facKey != null && facultyOccupied.contains(facKey)) continue;

                    boolean prev1 = isTheorySubjectAt(entriesToSave, normDept, sem, section, day, p - 1, subCode);
                    boolean prev2 = isTheorySubjectAt(entriesToSave, normDept, sem, section, day, p - 2, subCode);
                    boolean next1 = isTheorySubjectAt(entriesToSave, normDept, sem, section, day, p + 1, subCode);
                    boolean next2 = isTheorySubjectAt(entriesToSave, normDept, sem, section, day, p + 2, subCode);

                    if ((prev1 && prev2) || (next1 && next2) || (prev1 && next1)) continue;

                    Classroom assignedRoom = null;
                    for (Classroom c : classrooms) {
                        String rKey = c.getId() + "_" + day + "_P" + p;
                        if (!roomOccupied.contains(rKey)) {
                            assignedRoom = c;
                            break;
                        }
                    }

                    int score = 100;
                    if (currentDayCount == 0) score += 40;
                    if (!prev1 && !next1) score += 30;
                    if (prev1 || next1) score -= 15;

                    // Faculty Schedule Contiguity & Gap Compression Scoring
                    if (selectedFacId != null) {
                        boolean facHasPrev1 = facultyOccupied.contains(selectedFacId + "_" + day + "_P" + (p - 1));
                        boolean facHasNext1 = facultyOccupied.contains(selectedFacId + "_" + day + "_P" + (p + 1));
                        boolean facHasPrev2 = facultyOccupied.contains(selectedFacId + "_" + day + "_P" + (p - 2));
                        boolean facHasNext2 = facultyOccupied.contains(selectedFacId + "_" + day + "_P" + (p + 2));

                        if (facHasPrev1 || facHasNext1) {
                            score += 45;
                        } else if (facHasPrev2 || facHasNext2) {
                            score -= 25;
                        }
                    }

                    if (bestSlot == null || score > bestSlot.score) {
                        bestSlot = new TheoryCandidateSlot(day, p, selectedFac, assignedRoom, score);
                    }
                }
            }

            if (bestSlot != null) {
                String day = bestSlot.day;
                int p = bestSlot.period;
                User selectedFac = bestSlot.selectedFac;
                Classroom assignedRoom = bestSlot.assignedRoom;
                Long selectedFacId = selectedFac != null ? selectedFac.getId() : null;

                String facKey = selectedFacId != null ? (selectedFacId + "_" + day + "_P" + p) : null;
                String classKey = normDept + "_SEM" + sem + "_SEC" + section + "_" + day + "_P" + p;

                if (facKey != null) facultyOccupied.add(facKey);
                classOccupied.add(classKey);
                if (assignedRoom != null) roomOccupied.add(assignedRoom.getId() + "_" + day + "_P" + p);
                if (selectedFacId != null) facultyTotalHoursMap.put(selectedFacId, facultyTotalHoursMap.getOrDefault(selectedFacId, 0) + 1);

                entriesToSave.add(TimetableEntry.builder()
                        .department(normDept)
                        .dayOfWeek(toTitleCaseDay(day))
                        .period(p)
                        .subject(subCode)
                        .faculty(selectedFac)
                        .room(assignedRoom)
                        .version(version)
                        .semester(sem)
                        .section(section)
                        .academicYear(academicYear)
                        .build());

                String daySubKey = normDept + "_" + sem + "_" + section + "_" + day + "_" + subCode;
                subjectDayHours.put(daySubKey, subjectDayHours.getOrDefault(daySubKey, 0) + 1);
                unscheduledTheoryMap.put(alloc, unscheduledTheoryMap.get(alloc) - 1);
                scheduledHoursMap.put(alloc, scheduledHoursMap.get(alloc) + 1);
            }
        }

        // ─── PASS 5: Exhaustive Re-allocation & Placement Pass (Guarantee 100% Workload Hours Placement) ───
        for (FacultyWorkloadAllocation alloc : filteredAllocations) {
            int required = alloc.getHoursPerWeek() != null && alloc.getHoursPerWeek() > 0 ? alloc.getHoursPerWeek() : 3;

            while (scheduledHoursMap.getOrDefault(alloc, 0) < required) {
                String normDept = normalizeDepartment(alloc.getDepartment());
                int sem = alloc.getSemester() != null ? alloc.getSemester() : 3;
                String section = alloc.getSection() != null && !alloc.getSection().trim().isEmpty() ? alloc.getSection().trim().toUpperCase() : "A";
                String subCode = resolveDisplaySubjectCode(alloc);

                TimetableVersion version = versionMap.get(normDept + "_" + sem);

                TheoryCandidateSlot bestSlot = null;

                for (String day : days) {
                    String daySubKey = normDept + "_" + sem + "_" + section + "_" + day + "_" + subCode;
                    int currentDayCount = subjectDayHours.getOrDefault(daySubKey, 0);

                    for (int p = 1; p <= 6; p++) {
                        String classKey = normDept + "_SEM" + sem + "_SEC" + section + "_" + day + "_P" + p;
                        if (classOccupied.contains(classKey)) continue;

                        User selectedFac = findLowestWorkloadFaculty.apply(alloc, day + "_P" + p);
                        if (selectedFac == null) continue;
                        Long selectedFacId = selectedFac.getId();

                        String facKey = selectedFacId != null ? (selectedFacId + "_" + day + "_P" + p) : null;
                        if (facKey != null && facultyOccupied.contains(facKey)) continue;

                        boolean prev1 = isTheorySubjectAt(entriesToSave, normDept, sem, section, day, p - 1, subCode);
                        boolean prev2 = isTheorySubjectAt(entriesToSave, normDept, sem, section, day, p - 2, subCode);
                        boolean next1 = isTheorySubjectAt(entriesToSave, normDept, sem, section, day, p + 1, subCode);
                        boolean next2 = isTheorySubjectAt(entriesToSave, normDept, sem, section, day, p + 2, subCode);

                        // HARD CONSTRAINT: Prevent 3+ consecutive periods of the same theory subject
                        if ((prev1 && prev2) || (next1 && next2) || (prev1 && next1)) continue;

                        Classroom assignedRoom = null;
                        for (Classroom c : classrooms) {
                            String rKey = c.getId() + "_" + day + "_P" + p;
                            if (!roomOccupied.contains(rKey)) {
                                assignedRoom = c;
                                break;
                            }
                        }

                        int score = 100;
                        if (currentDayCount == 0) score += 40;
                        if (currentDayCount < 2) score += 20;
                        if (!prev1 && !next1) score += 30;

                        if (bestSlot == null || score > bestSlot.score) {
                            bestSlot = new TheoryCandidateSlot(day, p, selectedFac, assignedRoom, score);
                        }
                    }
                }

                if (bestSlot != null) {
                    String day = bestSlot.day;
                    int p = bestSlot.period;
                    User selectedFac = bestSlot.selectedFac;
                    Classroom assignedRoom = bestSlot.assignedRoom;
                    Long selectedFacId = selectedFac != null ? selectedFac.getId() : null;

                    String facKey = selectedFacId != null ? (selectedFacId + "_" + day + "_P" + p) : null;
                    String classKey = normDept + "_SEM" + sem + "_SEC" + section + "_" + day + "_P" + p;

                    if (facKey != null) facultyOccupied.add(facKey);
                    classOccupied.add(classKey);
                    if (assignedRoom != null) roomOccupied.add(assignedRoom.getId() + "_" + day + "_P" + p);
                    if (selectedFacId != null) facultyTotalHoursMap.put(selectedFacId, facultyTotalHoursMap.getOrDefault(selectedFacId, 0) + 1);

                    entriesToSave.add(TimetableEntry.builder()
                            .department(normDept)
                            .dayOfWeek(toTitleCaseDay(day))
                            .period(p)
                            .subject(subCode)
                            .faculty(selectedFac)
                            .room(assignedRoom)
                            .version(version)
                            .semester(sem)
                            .section(section)
                            .academicYear(academicYear)
                            .build());

                    String daySubKey = normDept + "_" + sem + "_" + section + "_" + day + "_" + subCode;
                    subjectDayHours.put(daySubKey, subjectDayHours.getOrDefault(daySubKey, 0) + 1);
                    scheduledHoursMap.put(alloc, scheduledHoursMap.getOrDefault(alloc, 0) + 1);
                } else {
                    break;
                }
            }
        }

        // ─── PASS 6: Absolute 100% Period Filler (Guarantee ZERO empty slots for all classes) ───
        for (String dept : distinctDepts) {
            String normDept = normalizeDepartment(dept);
            for (Integer sem : targetSemesters) {
                for (String section : distinctSections) {
                    List<FacultyWorkloadAllocation> classAllocs = filteredAllocations.stream()
                            .filter(a -> normalizeDepartment(a.getDepartment()).equalsIgnoreCase(normDept)
                                    && (a.getSemester() == null || a.getSemester().equals(sem))
                                    && (a.getSection() == null || a.getSection().trim().isEmpty() || a.getSection().equalsIgnoreCase(section)))
                            .collect(Collectors.toList());

                    if (classAllocs.isEmpty()) continue;

                    int allocIdx = 0;
                    TimetableVersion version = versionMap.get(normDept + "_" + sem);

                    for (String day : days) {
                        for (int p = 1; p <= 6; p++) {
                            final String currentDay = day;
                            final int currentPeriod = p;
                            final String currentSection = section;

                            boolean hasEntry = entriesToSave.stream().anyMatch(e ->
                                    normalizeDepartment(e.getDepartment()).equalsIgnoreCase(normDept) &&
                                            e.getSemester() != null && e.getSemester().equals(sem) &&
                                            (e.getSection() == null || e.getSection().equalsIgnoreCase(currentSection)) &&
                                            e.getDayOfWeek().equalsIgnoreCase(currentDay) &&
                                            e.getPeriod() == currentPeriod
                            );

                            if (!hasEntry) {
                                FacultyWorkloadAllocation bestAlloc = null;
                                for (int k = 0; k < classAllocs.size(); k++) {
                                    FacultyWorkloadAllocation candidate = classAllocs.get((allocIdx + k) % classAllocs.size());
                                    int reqH = candidate.getHoursPerWeek() != null && candidate.getHoursPerWeek() > 0 ? candidate.getHoursPerWeek() : 3;
                                    int schedH = scheduledHoursMap.getOrDefault(candidate, 0);

                                    // HARD CONSTRAINT: Never assign more hours than approved workload!
                                    if (schedH >= reqH) continue;

                                    String cSubCode = resolveDisplaySubjectCode(candidate);

                                    String daySubKey = normDept + "_" + sem + "_" + section + "_" + day + "_" + cSubCode;
                                    int dCount = subjectDayHours.getOrDefault(daySubKey, 0);

                                    boolean prev1 = isTheorySubjectAt(entriesToSave, normDept, sem, section, day, p - 1, cSubCode);
                                    boolean prev2 = isTheorySubjectAt(entriesToSave, normDept, sem, section, day, p - 2, cSubCode);
                                    boolean next1 = isTheorySubjectAt(entriesToSave, normDept, sem, section, day, p + 1, cSubCode);

                                    // Maximum 2 periods per day for theory subject, and max 2 consecutive periods
                                    if (dCount < 2 && !(prev1 && prev2) && !(prev1 && next1)) {
                                        bestAlloc = candidate;
                                        allocIdx = (allocIdx + k + 1) % classAllocs.size();
                                        break;
                                    }
                                }

                                if (bestAlloc == null) {
                                    // If all curriculum subjects reached max daily cap, schedule library/self-study for the class
                                    entriesToSave.add(TimetableEntry.builder()
                                            .department(normDept)
                                            .dayOfWeek(toTitleCaseDay(day))
                                            .period(p)
                                            .subject("LIBRARY_STUDY")
                                            .faculty(null)
                                            .room(null)
                                            .version(version)
                                            .semester(sem)
                                            .section(section)
                                            .academicYear(academicYear)
                                            .build());
                                    continue;
                                }

                                FacultyWorkloadAllocation alloc = bestAlloc;
                                User fac = resolveAllocationFaculty(alloc, allFacultyList);
                                String facKey = (fac != null) ? (fac.getId() + "_" + day + "_P" + p) : null;

                                if (facKey != null && facultyOccupied.contains(facKey)) {
                                    continue;
                                }

                                if (facKey != null) facultyOccupied.add(facKey);

                                String subCode = resolveDisplaySubjectCode(alloc);

                                Classroom assignedRoom = null;
                                for (Classroom c : classrooms) {
                                    String rKey = c.getId() + "_" + day + "_P" + p;
                                    if (!roomOccupied.contains(rKey)) {
                                        assignedRoom = c;
                                        roomOccupied.add(rKey);
                                        break;
                                    }
                                }

                                String daySubKey = normDept + "_" + sem + "_" + section + "_" + day + "_" + subCode;
                                subjectDayHours.put(daySubKey, subjectDayHours.getOrDefault(daySubKey, 0) + 1);
                                scheduledHoursMap.put(alloc, scheduledHoursMap.getOrDefault(alloc, 0) + 1);

                                entriesToSave.add(TimetableEntry.builder()
                                        .department(normDept)
                                        .dayOfWeek(toTitleCaseDay(day))
                                        .period(p)
                                        .subject(subCode)
                                        .faculty(fac)
                                        .room(assignedRoom)
                                        .version(version)
                                        .semester(sem)
                                        .section(section)
                                        .academicYear(academicYear)
                                        .build());
                            }
                        }
                    }
                }
            }
        }

        // ─── FINAL PRE-SAVE CONFLICT SANITIZER ───
        Set<String> finalFacOccupied = new HashSet<>();
        List<TimetableEntry> sanitizedEntries = new ArrayList<>();

        for (TimetableEntry e : entriesToSave) {
            if (e.getFaculty() != null && e.getDayOfWeek() != null) {
                String fKey = e.getFaculty().getId() + "_" + e.getDayOfWeek().toUpperCase() + "_P" + e.getPeriod();
                if (finalFacOccupied.contains(fKey)) {
                    System.out.println("[Sanitizer] Duplicate faculty slot conflict detected for " + e.getFaculty().getName() + " on " + fKey + " -> Nullifying faculty");
                    e.setFaculty(null);
                } else {
                    finalFacOccupied.add(fKey);
                }
            }
            sanitizedEntries.add(e);
        }
        entriesToSave = sanitizedEntries;

        for (TimetableEntry e : entriesToSave) {
            if (e.getFaculty() != null) {
                System.out.println("Saving TimetableEntry: Subject=" + e.getSubject() +
                                   " | FacultyId=" + e.getFaculty().getId() +
                                   " | FacultyName=" + e.getFaculty().getName());
                break;
            }
        }

        timetableEntryRepository.saveAll(entriesToSave);
        timetableEntryRepository.flush();

        long duration = System.currentTimeMillis() - startTime;

        TimetableValidationReport report = generateValidationReport(
                entriesToSave, filteredAllocations, scheduledHoursMap,
                academicYear, semesterCycle, distinctDepts, targetSemesters, distinctSections, duration,
                facultyOccupied, classOccupied, missingSubjectsBeforeOptimization
        );

        System.out.println("[MasterTimetable] Validation Status: " + report.overallStatus + " | Saved: " + report.subjectsScheduled + " entries in " + duration + " ms");

        return ResponseEntity.ok(report);
    }

    // ─── POST: Randomize Grid for Currently Selected Class Without Conflict ───
    public static class RandomizeClassRequest {
        public String department;
        public Integer semester;
    }

    @PostMapping("/randomize-class")
    @Transactional
    public ResponseEntity<?> randomizeClassTimetable(@RequestBody RandomizeClassRequest request) {
        if (request.department == null || request.department.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Department is required!");
        }
        String normDept = normalizeDepartment(request.department);
        int sem = request.semester != null ? request.semester : 3;

        // 1. Fetch active entries across institution EXCEPT for (normDept, sem)
        List<TimetableEntry> activeEntries = timetableEntryRepository.findActiveEntriesAcrossInstitution();
        Set<String> externalFacultyOccupied = new HashSet<>();

        for (TimetableEntry e : activeEntries) {
            String eDept = normalizeDepartment(e.getDepartment());
            Integer eSem = e.getSemester();
            if (!eDept.equalsIgnoreCase(normDept) || (eSem != null && !eSem.equals(sem))) {
                if (e.getFaculty() != null && e.getDayOfWeek() != null && e.getPeriod() != null) {
                    externalFacultyOccupied.add(e.getDayOfWeek() + "_P" + e.getPeriod() + "_F" + e.getFaculty().getId());
                }
            }
        }

        // 2. Fetch approved workload allocations for this specific class
        List<FacultyWorkloadAllocation> classAllocations = facultyWorkloadAllocationRepository.findByStatus("APPROVED")
                .stream()
                .filter(a -> normalizeDepartment(a.getDepartment()).equalsIgnoreCase(normDept) &&
                        (a.getSemester() == null || a.getSemester().equals(sem)))
                .collect(Collectors.toList());

        if (classAllocations.isEmpty()) {
            classAllocations = facultyWorkloadAllocationRepository.findAll()
                    .stream()
                    .filter(a -> normalizeDepartment(a.getDepartment()).equalsIgnoreCase(normDept) &&
                            (a.getSemester() == null || a.getSemester().equals(sem)))
                    .collect(Collectors.toList());
        }

        if (classAllocations.isEmpty()) {
            return ResponseEntity.badRequest().body("No workload allocations or subjects found for " + normDept + " (Semester " + sem + ")");
        }

        // Shuffle allocations for true randomization
        List<FacultyWorkloadAllocation> shuffledAllocations = new ArrayList<>(classAllocations);
        Collections.shuffle(shuffledAllocations, new Random());

        String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"};

        Optional<TimetableVersion> activeVersionOpt = timetableVersionRepository.findByDepartmentIgnoreCaseAndSemesterAndActiveTrue(normDept, sem);
        TimetableVersion version = activeVersionOpt.orElseGet(() ->
                timetableVersionRepository.save(TimetableVersion.builder()
                        .department(normDept)
                        .semester(sem)
                        .academicYear("2026-2027")
                        .versionName("Institutional Master Timetable (" + normDept + " Sem " + sem + ")")
                        .active(true)
                        .build())
        );

        timetableEntryRepository.deleteByVersionId(version.getId());

        Set<String> classOccupied = new HashSet<>();
        int totalEntriesSaved = 0;

        List<FacultyWorkloadAllocation> labAllocations = new ArrayList<>();
        List<FacultyWorkloadAllocation> theoryAllocations = new ArrayList<>();
        for (FacultyWorkloadAllocation alloc : shuffledAllocations) {
            if (isLabOrPractical(alloc)) {
                labAllocations.add(alloc);
            } else {
                theoryAllocations.add(alloc);
            }
        }

        // Labs in consecutive blocks
        for (FacultyWorkloadAllocation alloc : labAllocations) {
            User fac = alloc.getFaculty();
            Long facId = fac != null ? fac.getId() : null;
            int requiredHours = alloc.getHoursPerWeek() != null && alloc.getHoursPerWeek() > 0 ? alloc.getHoursPerWeek() : 2;
            int blockSize = Math.min(requiredHours, 2);
            int hoursScheduled = 0;
            String subCode = alloc.getCourseCode() != null && !alloc.getCourseCode().trim().isEmpty()
                    ? alloc.getCourseCode().trim()
                    : (alloc.getSubjectName() != null ? alloc.getSubjectName().trim() : "Course");

            for (String day : days) {
                if (hoursScheduled >= requiredHours) break;

                for (int p = 1; p <= 6 - blockSize + 1; p += 2) {
                    if (hoursScheduled >= requiredHours) break;

                    boolean blockAvailable = true;
                    for (int offset = 0; offset < blockSize; offset++) {
                        int period = p + offset;
                        String facKey = facId != null ? (day + "_P" + period + "_F" + facId) : null;
                        String secKey = normDept + "_SEM" + sem + "_" + day + "_P" + period;
                        if ((facKey != null && externalFacultyOccupied.contains(facKey)) || classOccupied.contains(secKey)) {
                            blockAvailable = false;
                            break;
                        }
                    }

                    if (blockAvailable) {
                        for (int offset = 0; offset < blockSize; offset++) {
                            int period = p + offset;
                            String facKey = facId != null ? (day + "_P" + period + "_F" + facId) : null;
                            String secKey = normDept + "_SEM" + sem + "_" + day + "_P" + period;
                            if (facKey != null) externalFacultyOccupied.add(facKey);
                            classOccupied.add(secKey);

                            timetableEntryRepository.save(TimetableEntry.builder()
                                    .department(normDept)
                                    .dayOfWeek(day)
                                    .period(period)
                                    .subject(subCode)
                                    .faculty(fac)
                                    .version(version)
                                    .semester(sem)
                                    .academicYear("2026-2027")
                                    .build());

                            hoursScheduled++;
                            totalEntriesSaved++;
                        }
                    }
                }
            }
        }

        // Theory multi-pass
        Map<String, Integer> subjectDayHours = new HashMap<>();
        Map<FacultyWorkloadAllocation, Integer> unscheduledHours = new HashMap<>();
        for (FacultyWorkloadAllocation alloc : theoryAllocations) {
            int req = alloc.getHoursPerWeek() != null && alloc.getHoursPerWeek() > 0 ? alloc.getHoursPerWeek() : 3;
            unscheduledHours.put(alloc, req);
        }

        for (int pass = 1; pass <= 2; pass++) {
            for (FacultyWorkloadAllocation alloc : theoryAllocations) {
                if (unscheduledHours.getOrDefault(alloc, 0) <= 0) continue;

                User fac = alloc.getFaculty();
                Long facId = fac != null ? fac.getId() : null;
                String subCode = alloc.getCourseCode() != null && !alloc.getCourseCode().trim().isEmpty()
                        ? alloc.getCourseCode().trim()
                        : (alloc.getSubjectName() != null ? alloc.getSubjectName().trim() : "Course");

                for (String day : days) {
                    if (unscheduledHours.getOrDefault(alloc, 0) <= 0) break;

                    String daySubKey = day + "_" + subCode;
                    int currentDayHours = subjectDayHours.getOrDefault(daySubKey, 0);
                    if (currentDayHours >= pass) continue;

                    for (int p = 1; p <= 6; p++) {
                        String facKey = facId != null ? (day + "_P" + p + "_F" + facId) : null;
                        String secKey = normDept + "_SEM" + sem + "_" + day + "_P" + p;

                        boolean facBusy = facKey != null && externalFacultyOccupied.contains(facKey);
                        boolean secBusy = classOccupied.contains(secKey);

                        if (!facBusy && !secBusy) {
                            if (facKey != null) externalFacultyOccupied.add(facKey);
                            classOccupied.add(secKey);

                            timetableEntryRepository.save(TimetableEntry.builder()
                                    .department(normDept)
                                    .dayOfWeek(day)
                                    .period(p)
                                    .subject(subCode)
                                    .faculty(fac)
                                    .version(version)
                                    .semester(sem)
                                    .academicYear("2026-2027")
                                    .build());

                            subjectDayHours.put(daySubKey, currentDayHours + 1);
                            unscheduledHours.put(alloc, unscheduledHours.get(alloc) - 1);
                            totalEntriesSaved++;
                            break;
                        }
                    }
                }
            }
        }

        // Fallback for remaining hours
        for (FacultyWorkloadAllocation alloc : theoryAllocations) {
            if (unscheduledHours.getOrDefault(alloc, 0) <= 0) continue;

            User fac = alloc.getFaculty();
            Long facId = fac != null ? fac.getId() : null;
            String subCode = alloc.getCourseCode() != null && !alloc.getCourseCode().trim().isEmpty()
                    ? alloc.getCourseCode().trim()
                    : (alloc.getSubjectName() != null ? alloc.getSubjectName().trim() : "Course");

            for (String day : days) {
                if (unscheduledHours.getOrDefault(alloc, 0) <= 0) break;

                String daySubKey = day + "_" + subCode;
                int currentDayHours = subjectDayHours.getOrDefault(daySubKey, 0);
                if (currentDayHours >= 2) continue;

                for (int p = 1; p <= 6; p++) {
                    if (unscheduledHours.getOrDefault(alloc, 0) <= 0) break;

                    String facKey = facId != null ? (day + "_P" + p + "_F" + facId) : null;
                    String secKey = normDept + "_SEM" + sem + "_" + day + "_P" + p;

                    boolean facBusy = facKey != null && externalFacultyOccupied.contains(facKey);
                    boolean secBusy = classOccupied.contains(secKey);

                    if (!facBusy && !secBusy) {
                        if (facKey != null) externalFacultyOccupied.add(facKey);
                        classOccupied.add(secKey);

                        timetableEntryRepository.save(TimetableEntry.builder()
                                .department(normDept)
                                .dayOfWeek(day)
                                .period(p)
                                .subject(subCode)
                                .faculty(fac)
                                .version(version)
                                .semester(sem)
                                .academicYear("2026-2027")
                                .build());

                        subjectDayHours.put(daySubKey, currentDayHours + 1);
                        unscheduledHours.put(alloc, unscheduledHours.get(alloc) - 1);
                        totalEntriesSaved++;
                    }
                }
            }
        }

        return ResponseEntity.ok("Grid randomized with multi-pass distribution for " + normDept + " (Semester " + sem + ")");
    }

    // ─── GET: Student timetable ────────────────────────────────────────────────
    @GetMapping("/student")
    public ResponseEntity<?> getStudentTimetable(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User user = userOpt.get();
        String normalizedDept = normalizeDepartment(user.getDepartment());
        Integer sem = user.getSemester() != null ? user.getSemester() : 3;
        String section = user.getSection() != null && !user.getSection().trim().isEmpty() ? user.getSection().trim().toUpperCase() : "A";

        List<TimetableEntry> entries = new ArrayList<>();

        // 1. Check active version
        Optional<TimetableVersion> activeVersion = timetableVersionRepository.findByDepartmentIgnoreCaseAndSemesterAndActiveTrue(normalizedDept, sem);
        if (activeVersion.isPresent()) {
            entries = timetableEntryRepository.findByVersionId(activeVersion.get().getId()).stream()
                    .filter(e -> e.getSection() == null || e.getSection().trim().isEmpty() || e.getSection().trim().equalsIgnoreCase(section))
                    .collect(Collectors.toList());
        }

        // 2. Fallback to department & semester & section
        if (entries.isEmpty()) {
            entries = timetableEntryRepository.findByDepartmentIgnoreCase(normalizedDept).stream()
                    .filter(e -> e.getSemester() != null && e.getSemester().equals(sem))
                    .filter(e -> e.getSection() == null || e.getSection().trim().isEmpty() || e.getSection().trim().equalsIgnoreCase(section))
                    .collect(Collectors.toList());
        }

        // 3. Fallback to department & section
        if (entries.isEmpty()) {
            entries = timetableEntryRepository.findByDepartmentIgnoreCase(normalizedDept).stream()
                    .filter(e -> e.getSection() == null || e.getSection().trim().isEmpty() || e.getSection().trim().equalsIgnoreCase(section))
                    .collect(Collectors.toList());
        }

        enrichTimetableEntries(entries);
        return ResponseEntity.ok(entries);
    }

    // ─── GET: Faculty timetable ────────────────────────────────────────────────
    @GetMapping("/faculty")
    public ResponseEntity<?> getFacultyTimetable(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");

        List<TimetableEntry> activeEntries = timetableEntryRepository.findByFacultyId(userOpt.get().getId()).stream()
                .filter(e -> e.getVersion() != null && e.getVersion().isActive())
                .filter(e -> e.getSubject() != null && !e.getSubject().equalsIgnoreCase("FREE_ACTIVITY"))
                .collect(Collectors.toList());
        enrichTimetableEntries(activeEntries);
        return ResponseEntity.ok(activeEntries);
    }

    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<?> getFacultyTimetableById(@PathVariable Long facultyId) {
        List<TimetableEntry> activeEntries = timetableEntryRepository.findByFacultyId(facultyId).stream()
                .filter(e -> e.getVersion() != null && e.getVersion().isActive())
                .filter(e -> e.getSubject() != null && !e.getSubject().equalsIgnoreCase("FREE_ACTIVITY"))
                .collect(Collectors.toList());
        enrichTimetableEntries(activeEntries);
        return ResponseEntity.ok(activeEntries);
    }

    // ─── GET: All Institutional Classes & Timetables ────────────────────────────
    @GetMapping("/institution-classes")
    public ResponseEntity<?> getInstitutionClasses(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String section) {

        List<TimetableEntry> allEntries = timetableEntryRepository.findAll();
        boolean hasActiveVersions = allEntries.stream().anyMatch(e -> e.getVersion() != null && e.getVersion().isActive());

        List<TimetableEntry> entries = allEntries.stream()
                .filter(e -> !hasActiveVersions || (e.getVersion() != null && e.getVersion().isActive()))
                .filter(e -> e.getSubject() != null && !e.getSubject().trim().isEmpty())
                .filter(e -> department == null || department.trim().isEmpty() || department.equalsIgnoreCase("All")
                        || normalizeDepartment(e.getDepartment()).equalsIgnoreCase(normalizeDepartment(department)))
                .filter(e -> semester == null || semester == 0
                        || (e.getSemester() != null && e.getSemester().equals(semester)))
                .filter(e -> section == null || section.trim().isEmpty() || section.equalsIgnoreCase("All") || section.equalsIgnoreCase("ALL")
                        || (e.getSection() != null && e.getSection().equalsIgnoreCase(section.trim())))
                .collect(Collectors.toList());

        enrichTimetableEntries(entries);
        return ResponseEntity.ok(entries);
    }

    // ─── GET: Current class status ─────────────────────────────────────────────
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentClassStatus(
            @RequestParam(required = false) String simulatedDay,
            @RequestParam(required = false) String simulatedTime,
            @RequestParam(required = false) String department,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User user = userOpt.get();

        String dept = (department != null && !department.trim().isEmpty()) ? department : user.getDepartment();
        if (dept == null || dept.trim().isEmpty()) dept = "M.Tech CSE";
        String normalizedDept = normalizeDepartment(dept);

        String dayOfWeek = (simulatedDay != null && !simulatedDay.trim().isEmpty())
                ? simulatedDay : getTitleCaseDayOfWeek(LocalDate.now());
        LocalTime time = (simulatedTime != null && !simulatedTime.trim().isEmpty())
                ? LocalTime.parse(simulatedTime) : LocalTime.now();

        if (dayOfWeek.equalsIgnoreCase("Saturday") || dayOfWeek.equalsIgnoreCase("Sunday")) {
            return ResponseEntity.ok(CurrentClassResponse.builder().currentClass(null).nextClass(null)
                    .periodNumber(0).status("WEEKEND").timeRemainingMinutes(0L)
                    .elapsedMinutes(0L).totalPeriodMinutes(0L).todayTimeline(List.of()).build());
        }

        List<TimetableEntry> dayEntries = new ArrayList<>();
        if (user.getRole() != null && user.getRole().name().equalsIgnoreCase("FACULTY")) {
            dayEntries = timetableEntryRepository.findByFacultyId(user.getId()).stream()
                    .filter(e -> e.getVersion() != null && e.getVersion().isActive())
                    .filter(e -> e.getDayOfWeek() != null && e.getDayOfWeek().equalsIgnoreCase(dayOfWeek))
                    .collect(Collectors.toList());
            if (dayEntries.isEmpty()) {
                dayEntries = timetableEntryRepository.findByFacultyId(user.getId()).stream()
                        .filter(e -> e.getDayOfWeek() != null && e.getDayOfWeek().equalsIgnoreCase(dayOfWeek))
                        .collect(Collectors.toList());
            }
        } else {
            Integer sem = user.getSemester() != null ? user.getSemester() : 3;
            String section = user.getSection() != null && !user.getSection().trim().isEmpty() ? user.getSection().trim().toUpperCase() : "A";

            Optional<TimetableVersion> activeVersion = timetableVersionRepository.findByDepartmentIgnoreCaseAndSemesterAndActiveTrue(normalizedDept, sem);
            if (activeVersion.isPresent()) {
                dayEntries = timetableEntryRepository.findByVersionId(activeVersion.get().getId()).stream()
                        .filter(e -> e.getDayOfWeek() != null && e.getDayOfWeek().equalsIgnoreCase(dayOfWeek))
                        .filter(e -> e.getSection() == null || e.getSection().trim().isEmpty() || e.getSection().trim().equalsIgnoreCase(section))
                        .collect(Collectors.toList());
            }

            if (dayEntries.isEmpty()) {
                dayEntries = timetableEntryRepository.findByDepartmentIgnoreCase(normalizedDept).stream()
                        .filter(e -> e.getDayOfWeek() != null && e.getDayOfWeek().equalsIgnoreCase(dayOfWeek))
                        .filter(e -> e.getSemester() == null || e.getSemester().equals(sem))
                        .filter(e -> e.getSection() == null || e.getSection().trim().isEmpty() || e.getSection().trim().equalsIgnoreCase(section))
                        .collect(Collectors.toList());
            }

            if (dayEntries.isEmpty()) {
                dayEntries = timetableEntryRepository.findByDepartmentIgnoreCase(normalizedDept).stream()
                        .filter(e -> e.getDayOfWeek() != null && e.getDayOfWeek().equalsIgnoreCase(dayOfWeek))
                        .collect(Collectors.toList());
            }
        }

        enrichTimetableEntries(dayEntries);

        PeriodTime activePeriod = null;
        for (PeriodTime pt : periods) {
            if ((time.equals(pt.start) || time.isAfter(pt.start)) && time.isBefore(pt.end)) {
                activePeriod = pt; break;
            }
        }

        String status = "FREE";
        TimetableEntry currentClass = null;
        TimetableEntry nextClass = null;
        Long timeRemaining = 0L, elapsed = 0L, total = 0L;

        if (time.isBefore(LocalTime.of(8, 45))) {
            status = "BEFORE_COLLEGE";
            nextClass = findNextScheduledClass(dayEntries, 0);
            timeRemaining = ChronoUnit.MINUTES.between(time, LocalTime.of(8, 45));
        } else if (!time.isBefore(LocalTime.of(15, 30))) {
            status = "ENDED";
        } else if (activePeriod != null) {
            timeRemaining = ChronoUnit.MINUTES.between(time, activePeriod.end);
            elapsed = ChronoUnit.MINUTES.between(activePeriod.start, time);
            total = ChronoUnit.MINUTES.between(activePeriod.start, activePeriod.end);
            if (activePeriod.isBreak) {
                status = activePeriod.name.contains("Lunch") ? "LUNCH" : "BREAK";
                int afterPeriod = activePeriod.name.contains("Lunch") ? 4 : 2;
                nextClass = findNextScheduledClass(dayEntries, afterPeriod);
            } else {
                final int pNum = activePeriod.number;
                Optional<TimetableEntry> activeEntry = dayEntries.stream().filter(e -> e.getPeriod() == pNum).findFirst();
                if (activeEntry.isPresent() && activeEntry.get().getSubject() != null && !activeEntry.get().getSubject().trim().isEmpty()) {
                    status = "CLASS"; currentClass = activeEntry.get();
                } else { status = "FREE"; }
                nextClass = findNextScheduledClass(dayEntries, pNum);
            }
        }

        List<CurrentClassResponse.PeriodDetails> todayTimeline = new ArrayList<>();
        for (PeriodTime pt : periods) {
            if (pt.isBreak) {
                todayTimeline.add(CurrentClassResponse.PeriodDetails.builder().period(0).subject(pt.name)
                        .facultyName("").startTime(formatTime(pt.start)).endTime(formatTime(pt.end))
                        .isActive(activePeriod != null && activePeriod.isBreak && activePeriod.name.equals(pt.name))
                        .isCompleted(time.isAfter(pt.end) || time.equals(pt.end)).build());
            } else {
                final int pNum = pt.number;
                Optional<TimetableEntry> entry = dayEntries.stream().filter(e -> e.getPeriod() == pNum).findFirst();
                String sub = entry.map(TimetableEntry::getSubject).orElse(null);
                String fName = entry.filter(e -> e.getFaculty() != null).map(e -> e.getFaculty().getName()).orElse("");
                todayTimeline.add(CurrentClassResponse.PeriodDetails.builder().period(pNum)
                        .subject(sub != null && !sub.trim().isEmpty() ? sub : "Free Hour").facultyName(fName)
                        .startTime(formatTime(pt.start)).endTime(formatTime(pt.end))
                        .isActive(activePeriod != null && !activePeriod.isBreak && activePeriod.number == pNum)
                        .isCompleted(time.isAfter(pt.end) || time.equals(pt.end)).build());
            }
        }

        return ResponseEntity.ok(CurrentClassResponse.builder().currentClass(currentClass).nextClass(nextClass)
                .periodNumber(activePeriod != null ? activePeriod.number : 0).status(status)
                .timeRemainingMinutes(timeRemaining).elapsedMinutes(elapsed).totalPeriodMinutes(total)
                .todayTimeline(todayTimeline).build());
    }

    // ─── GET: Subject suggestion for faculty scan ──────────────────────────────
    @GetMapping("/suggest-subject")
    public ResponseEntity<?> suggestSubject(
            @RequestParam(required = false) String simulatedDay,
            @RequestParam(required = false) String simulatedTime,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty() || userOpt.get().getRole() != Role.FACULTY) {
            return ResponseEntity.badRequest().body("Only faculty can request subject suggestions.");
        }
        User faculty = userOpt.get();

        String dayOfWeek = (simulatedDay != null && !simulatedDay.trim().isEmpty())
                ? simulatedDay : getTitleCaseDayOfWeek(LocalDate.now());
        LocalTime time = (simulatedTime != null && !simulatedTime.trim().isEmpty())
                ? LocalTime.parse(simulatedTime) : LocalTime.now();

        if (dayOfWeek.equalsIgnoreCase("Saturday") || dayOfWeek.equalsIgnoreCase("Sunday")) {
            return ResponseEntity.ok(new TimetableSuggestionResponse(null, 0, null, null));
        }

        List<TimetableEntry> facultyEntries = timetableEntryRepository.findByFacultyId(faculty.getId());
        List<TimetableEntry> todayFacultyEntries = facultyEntries.stream()
                .filter(e -> e.getDayOfWeek().equalsIgnoreCase(dayOfWeek)).toList();

        if (todayFacultyEntries.isEmpty()) {
            return ResponseEntity.ok(new TimetableSuggestionResponse(null, 0, null, null));
        }

        PeriodTime activePeriod = null;
        for (PeriodTime pt : periods) {
            if ((time.equals(pt.start) || time.isAfter(pt.start)) && time.isBefore(pt.end)) {
                activePeriod = pt; break;
            }
        }

        if (activePeriod != null && !activePeriod.isBreak) {
            final int pNum = activePeriod.number;
            Optional<TimetableEntry> currentEntry = todayFacultyEntries.stream()
                    .filter(e -> e.getPeriod() == pNum).findFirst();
            if (currentEntry.isPresent()) {
                PeriodTime finalActive = activePeriod;
                return ResponseEntity.ok(TimetableSuggestionResponse.builder()
                        .suggestedSubject(currentEntry.get().getSubject())
                        .period(pNum).startTime(formatTime(finalActive.start)).endTime(formatTime(finalActive.end)).build());
            }
        }

        int currentPeriodNumber = activePeriod != null ? activePeriod.number : 0;
        if (activePeriod != null && activePeriod.isBreak) {
            currentPeriodNumber = activePeriod.name.contains("Lunch") ? 4 : 2;
        }

        final int finalPNum = currentPeriodNumber;
        Optional<TimetableEntry> nextEntry = todayFacultyEntries.stream()
                .filter(e -> e.getPeriod() > finalPNum)
                .min(Comparator.comparingInt(TimetableEntry::getPeriod));

        if (nextEntry.isPresent()) {
            TimetableEntry entry = nextEntry.get();
            PeriodTime pt = periods.stream().filter(p -> p.number == entry.getPeriod()).findFirst().orElse(null);
            return ResponseEntity.ok(TimetableSuggestionResponse.builder()
                    .suggestedSubject(entry.getSubject()).period(entry.getPeriod())
                    .startTime(pt != null ? formatTime(pt.start) : null)
                    .endTime(pt != null ? formatTime(pt.end) : null).build());
        }

        Optional<TimetableEntry> firstEntry = todayFacultyEntries.stream()
                .min(Comparator.comparingInt(TimetableEntry::getPeriod));
        if (firstEntry.isPresent()) {
            TimetableEntry entry = firstEntry.get();
            PeriodTime pt = periods.stream().filter(p -> p.number == entry.getPeriod()).findFirst().orElse(null);
            return ResponseEntity.ok(TimetableSuggestionResponse.builder()
                    .suggestedSubject(entry.getSubject()).period(entry.getPeriod())
                    .startTime(pt != null ? formatTime(pt.start) : null)
                    .endTime(pt != null ? formatTime(pt.end) : null).build());
        }

        return ResponseEntity.ok(new TimetableSuggestionResponse(null, 0, null, null));
    }

    private static class TheoryCandidateSlot {
        String day;
        int period;
        User selectedFac;
        Classroom assignedRoom;
        int score;

        TheoryCandidateSlot(String day, int period, User selectedFac, Classroom assignedRoom, int score) {
            this.day = day;
            this.period = period;
            this.selectedFac = selectedFac;
            this.assignedRoom = assignedRoom;
            this.score = score;
        }
    }

    private static String resolveDisplaySubjectCode(FacultyWorkloadAllocation alloc) {
        if (alloc == null) return "Course";
        String code = alloc.getCourseCode() != null ? alloc.getCourseCode().trim() : "";
        if (code.isEmpty() || code.matches("^\\d+$") || code.equalsIgnoreCase("25XXXX")) {
            if (alloc.getSubjectName() != null && !alloc.getSubjectName().trim().isEmpty()) {
                return alloc.getSubjectName().trim();
            }
        }
        return !code.isEmpty() ? code : "Course";
    }

    private static boolean isTheorySubjectAt(List<TimetableEntry> entries, String normDept, int sem, String section, String day, int period, String subCode) {
        if (period < 1 || period > 6 || subCode == null) return false;
        return entries.stream().anyMatch(e ->
                normalizeDepartment(e.getDepartment()).equalsIgnoreCase(normDept)
                && e.getSemester() != null && e.getSemester() == sem
                && e.getSection() != null && e.getSection().equalsIgnoreCase(section)
                && e.getDayOfWeek() != null && e.getDayOfWeek().equalsIgnoreCase(day)
                && e.getPeriod() == period
                && e.getSubject() != null && e.getSubject().equalsIgnoreCase(subCode)
        );
    }

    private void enrichTimetableEntries(List<TimetableEntry> entries) {
        if (entries == null || entries.isEmpty()) return;
        List<SubjectMaster> allSubjects = subjectMasterRepository.findAll();
        Map<String, String> subNameMap = new HashMap<>();
        Map<String, String> codeMap = new HashMap<>();

        for (SubjectMaster sm : allSubjects) {
            if (sm.getSubjectCode() != null && sm.getSubjectName() != null) {
                String c = sm.getSubjectCode().trim();
                String n = sm.getSubjectName().trim();
                subNameMap.put(c.toUpperCase(), n);
                subNameMap.put(n.toUpperCase(), n);
                codeMap.put(n.toUpperCase(), c);
                codeMap.put(c.toUpperCase(), c);
            }
        }

        List<FacultyWorkloadAllocation> allAlloc = facultyWorkloadAllocationRepository.findAll();
        for (FacultyWorkloadAllocation a : allAlloc) {
            String resolvedCode = resolveDisplaySubjectCode(a);
            String rawCode = a.getCourseCode() != null ? a.getCourseCode().trim() : null;
            String name = a.getSubjectName() != null ? a.getSubjectName().trim() : null;

            if (name != null && !name.isEmpty()) {
                if (resolvedCode != null && !resolvedCode.isEmpty()) {
                    subNameMap.putIfAbsent(resolvedCode.toUpperCase(), name);
                    codeMap.putIfAbsent(resolvedCode.toUpperCase(), resolvedCode);
                }
                if (rawCode != null && !rawCode.isEmpty()) {
                    subNameMap.putIfAbsent(rawCode.toUpperCase(), name);
                    codeMap.putIfAbsent(rawCode.toUpperCase(), rawCode);
                }
                subNameMap.putIfAbsent(name.toUpperCase(), name);
                if (resolvedCode != null && !resolvedCode.isEmpty()) {
                    codeMap.putIfAbsent(name.toUpperCase(), resolvedCode);
                }
            }
        }

        for (TimetableEntry e : entries) {
            if (e.getSubject() != null) {
                String sub = e.getSubject().trim();
                String upper = sub.toUpperCase();
                String resolvedName = subNameMap.getOrDefault(upper, sub);
                String resolvedCode = codeMap.getOrDefault(upper, sub);

                e.setSubjectName(resolvedName);
                e.setCourseCode(resolvedCode);
            }
        }
    }
}
