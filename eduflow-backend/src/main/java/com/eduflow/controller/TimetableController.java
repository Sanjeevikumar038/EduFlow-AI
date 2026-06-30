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
            new PeriodTime(6, "Period 6", LocalTime.of(14,35), LocalTime.of(15,30), false),
            new PeriodTime(7, "Period 7", LocalTime.of(15,30), LocalTime.of(16,25), false),
            new PeriodTime(8, "Period 8", LocalTime.of(16,25), LocalTime.of(17,20), false)
    );

    // ─── Helpers ───────────────────────────────────────────────────────────────
    private String normalizeDepartment(String dept) {
        if (dept == null) return "";
        String upper = dept.trim().toUpperCase();
        if (upper.contains("MTECH CSE") || upper.contains("M.TECH CSE") || upper.contains("M.TECH. CSE")) return "M.Tech CSE";
        if (upper.equals("CSE") || upper.contains("COMPUTER SCIENCE")) return "CSE";
        if (upper.equals("IT") || upper.contains("INFORMATION TECHNOLOGY")) return "IT";
        if (upper.equals("ECE") || upper.contains("ELECTRONICS")) return "ECE";
        return dept;
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

    // ─── GET: Department timetable (active version) ────────────────────────────
    @GetMapping("/department/{department}")
    public ResponseEntity<List<TimetableEntry>> getDepartmentTimetable(@PathVariable String department) {
        String normalized = normalizeDepartment(department);
        // Prefer active version entries
        Optional<TimetableVersion> activeVersion = timetableVersionRepository.findByDepartmentIgnoreCaseAndActiveTrue(normalized);
        if (activeVersion.isPresent()) {
            return ResponseEntity.ok(timetableEntryRepository.findByVersionId(activeVersion.get().getId()));
        }
        return ResponseEntity.ok(timetableEntryRepository.findByDepartmentIgnoreCase(normalized));
    }

    // ─── Batch request DTO ─────────────────────────────────────────────────────
    public static class BatchTimetableRequest {
        public String department;
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

        // Resolve version
        TimetableVersion version = null;
        if (request.versionId != null) {
            version = timetableVersionRepository.findById(request.versionId).orElse(null);
            if (version == null) return ResponseEntity.badRequest().body("Timetable version not found!");
        } else {
            Optional<TimetableVersion> activeVersion = timetableVersionRepository.findByDepartmentIgnoreCaseAndActiveTrue(normalizedDept);
            version = activeVersion.orElse(null);
        }

        if (version == null) return ResponseEntity.badRequest().body("No active timetable version found for " + normalizedDept + ". Create a version first.");

        timetableEntryRepository.deleteByVersionId(version.getId());

        if (request.entries != null) {
            for (BatchTimetableRequest.EntryDto dto : request.entries) {
                User faculty = dto.facultyId != null ? userRepository.findById(dto.facultyId).orElse(null) : null;
                Classroom room = dto.roomId != null ? classroomRepository.findById(dto.roomId).orElse(null) : null;
                timetableEntryRepository.save(TimetableEntry.builder()
                        .department(normalizedDept).dayOfWeek(dto.dayOfWeek).period(dto.period)
                        .subject(dto.subject).faculty(faculty).room(room)
                        .version(version).semester(version.getSemester()).academicYear(version.getAcademicYear())
                        .build());
            }
        }
        return ResponseEntity.ok("Timetable updated successfully for " + normalizedDept);
    }

    // ─── POST: Auto-generate timetable ─────────────────────────────────────────
    public static class AutoGenerateRequest {
        public String department;
        public Integer semester;
        public String academicYear;
        public Long versionId;
    }

    @PostMapping("/auto-generate")
    @Transactional
    public ResponseEntity<?> autoGenerate(@RequestBody AutoGenerateRequest request) {
        String normalizedDept = normalizeDepartment(request.department);

        TimetableVersion version;
        if (request.versionId != null) {
            version = timetableVersionRepository.findById(request.versionId).orElse(null);
            if (version == null) return ResponseEntity.badRequest().body("Version not found!");
        } else {
            Optional<TimetableVersion> activeVersion = timetableVersionRepository.findByDepartmentIgnoreCaseAndActiveTrue(normalizedDept);
            version = activeVersion.orElse(null);
            if (version == null) return ResponseEntity.badRequest().body("No active version for " + normalizedDept);
        }

        // Get all subjects for this dept
        List<SubjectMaster> subjects = subjectMasterRepository.findByDepartmentIgnoreCaseAndActiveTrue(normalizedDept);
        if (subjects.isEmpty()) return ResponseEntity.badRequest().body("No active subjects found for " + normalizedDept);

        // Build period pool based on weeklyHours
        List<String> periodPool = new ArrayList<>();
        for (SubjectMaster s : subjects) {
            int hours = s.getWeeklyHours() != null ? s.getWeeklyHours() : 3;
            for (int i = 0; i < hours; i++) periodPool.add(s.getSubjectCode());
        }
        Collections.shuffle(periodPool, new Random());

        // Get faculty on leave today (skip them)
        Set<Long> onLeaveToday = new HashSet<>();
        LocalDate today = LocalDate.now();
        facultyAvailabilityRepository.findByDateAndAvailableFalse(today)
                .forEach(a -> onLeaveToday.add(a.getFaculty().getId()));

        // Clear existing entries for this version
        timetableEntryRepository.deleteByVersionId(version.getId());

        String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"};
        int poolIdx = 0;
        final TimetableVersion finalVersion = version;

        // Track consecutive period counts per faculty per day to enforce constraints
        Map<String, Map<Long, Integer>> consecutiveMap = new HashMap<>(); // day -> facultyId -> count

        for (String day : days) {
            consecutiveMap.put(day, new HashMap<>());
            int prevSubjectStart = -1;
            String prevSubject = null;
            int consecutiveSubjectCount = 0;

            for (int p = 1; p <= 8; p++) {
                if (poolIdx >= periodPool.size()) { Collections.shuffle(periodPool, new Random()); poolIdx = 0; }
                String subCode = periodPool.get(poolIdx++);

                // Enforce: max 2 consecutive same subject
                if (subCode.equals(prevSubject)) {
                    consecutiveSubjectCount++;
                    if (consecutiveSubjectCount >= 2) {
                        // Skip to next different subject
                        String original = subCode;
                        for (int attempt = 0; attempt < periodPool.size(); attempt++) {
                            if (poolIdx >= periodPool.size()) { Collections.shuffle(periodPool, new Random()); poolIdx = 0; }
                            subCode = periodPool.get(poolIdx);
                            if (!subCode.equals(original)) { poolIdx++; break; }
                            poolIdx++;
                        }
                        consecutiveSubjectCount = 0;
                    }
                } else {
                    consecutiveSubjectCount = 1;
                    prevSubject = subCode;
                }

                // Find best faculty for subject (PRIMARY > SECONDARY, skip on-leave)
                String finalSubCode = subCode;
                SubjectMaster subjectMaster = subjects.stream()
                        .filter(s -> s.getSubjectCode().equalsIgnoreCase(finalSubCode)).findFirst().orElse(null);

                User assignedFaculty = null;
                if (subjectMaster != null) {
                    List<FacultyExpertise> experts = facultyExpertiseRepository.findBySubjectId(subjectMaster.getId());
                    // Remove on-leave
                    experts = experts.stream().filter(e -> !onLeaveToday.contains(e.getFaculty().getId())).toList();

                    // Enforce max 4 consecutive teaching slots per faculty per day
                    Map<Long, Integer> dayConsecutive = consecutiveMap.get(day);
                    List<FacultyExpertise> primary = experts.stream()
                            .filter(e -> e.getExpertiseLevel() == ExpertiseLevel.PRIMARY
                                    && dayConsecutive.getOrDefault(e.getFaculty().getId(), 0) < 4).toList();
                    List<FacultyExpertise> secondary = experts.stream()
                            .filter(e -> e.getExpertiseLevel() == ExpertiseLevel.SECONDARY
                                    && dayConsecutive.getOrDefault(e.getFaculty().getId(), 0) < 4).toList();

                    List<FacultyExpertise> chosen = !primary.isEmpty() ? primary : secondary;
                    if (!chosen.isEmpty()) {
                        FacultyExpertise pick = chosen.get(new Random().nextInt(chosen.size()));
                        assignedFaculty = pick.getFaculty();
                        dayConsecutive.merge(assignedFaculty.getId(), 1, Integer::sum);
                    }
                }

                timetableEntryRepository.save(TimetableEntry.builder()
                        .department(normalizedDept).dayOfWeek(day).period(p)
                        .subject(subCode).faculty(assignedFaculty)
                        .version(finalVersion)
                        .semester(finalVersion.getSemester())
                        .academicYear(finalVersion.getAcademicYear())
                        .build());
            }
        }

        return ResponseEntity.ok(Map.of(
            "message", "Timetable auto-generated for " + normalizedDept,
            "department", normalizedDept,
            "version", version.getVersionName(),
            "totalEntries", timetableEntryRepository.findByVersionId(version.getId()).size()
        ));
    }

    // ─── GET: Student timetable ────────────────────────────────────────────────
    @GetMapping("/student")
    public ResponseEntity<?> getStudentTimetable(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        String normalizedDept = normalizeDepartment(userOpt.get().getDepartment());
        Optional<TimetableVersion> activeVersion = timetableVersionRepository.findByDepartmentIgnoreCaseAndActiveTrue(normalizedDept);
        if (activeVersion.isPresent()) {
            return ResponseEntity.ok(timetableEntryRepository.findByVersionId(activeVersion.get().getId()));
        }
        return ResponseEntity.ok(timetableEntryRepository.findByDepartmentIgnoreCase(normalizedDept));
    }

    // ─── GET: Faculty timetable ────────────────────────────────────────────────
    @GetMapping("/faculty")
    public ResponseEntity<?> getFacultyTimetable(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        return ResponseEntity.ok(timetableEntryRepository.findByFacultyId(userOpt.get().getId()));
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

        List<TimetableEntry> dayEntries;
        Optional<TimetableVersion> activeVersion = timetableVersionRepository.findByDepartmentIgnoreCaseAndActiveTrue(normalizedDept);
        if (activeVersion.isPresent()) {
            dayEntries = timetableEntryRepository.findByVersionId(activeVersion.get().getId())
                    .stream().filter(e -> e.getDayOfWeek().equalsIgnoreCase(dayOfWeek)).toList();
        } else {
            dayEntries = timetableEntryRepository.findByDepartmentIgnoreCase(normalizedDept)
                    .stream().filter(e -> e.getDayOfWeek().equalsIgnoreCase(dayOfWeek)).toList();
        }

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
        } else if (!time.isBefore(LocalTime.of(17, 20))) {
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
}
