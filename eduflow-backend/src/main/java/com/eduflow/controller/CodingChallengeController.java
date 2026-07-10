package com.eduflow.controller;

import com.eduflow.entity.*;
import com.eduflow.repository.*;
import com.eduflow.service.GroqService;
import com.eduflow.util.CodeExecutor;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api/coding")
@CrossOrigin(origins = "*")
public class CodingChallengeController {

    @Autowired private CodingQuestionBankRepository codingQuestionBankRepository;
    @Autowired private CodingChallengeRepository codingChallengeRepository;
    @Autowired private CodingSubmissionRepository codingSubmissionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TimetableEntryRepository timetableEntryRepository;
    @Autowired private AttendanceSessionRepository attendanceSessionRepository;
    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private StudentQuestionProgressRepository studentQuestionProgressRepository;
    @Autowired private CodingProgressRepository codingProgressRepository;
    @Autowired private GroqService groqService;

    // Period timings helper
    private static class PeriodTime {
        int number;
        LocalTime start;
        LocalTime end;
        PeriodTime(int n, LocalTime s, LocalTime e) {
            this.number = n;
            this.start = s;
            this.end = e;
        }
    }

    private final List<PeriodTime> periods = List.of(
            new PeriodTime(1, LocalTime.of(8,45), LocalTime.of(9,40)),
            new PeriodTime(2, LocalTime.of(9,40), LocalTime.of(10,35)),
            new PeriodTime(3, LocalTime.of(10,50), LocalTime.of(11,45)),
            new PeriodTime(4, LocalTime.of(11,45), LocalTime.of(12,40)),
            new PeriodTime(5, LocalTime.of(13,40), LocalTime.of(14,35)),
            new PeriodTime(6, LocalTime.of(14,35), LocalTime.of(15,30))
    );

    @GetMapping("/problems")
    public ResponseEntity<?> getAllProblems() {
        return ResponseEntity.ok(codingQuestionBankRepository.findByActiveTrue());
    }

    public static class AssignActivityRequest {
        public String date; // "YYYY-MM-DD"
        public String activityName;
        public String department;
        public Long questionBankId;
    }

    @PostMapping("/assign-activity")
    @Transactional
    public ResponseEntity<?> assignActivity(
            @RequestBody AssignActivityRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User user = userOpt.get();

        if (user.getRole() != Role.FACULTY && user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("Only faculty or admin can assign activity!");
        }

        String dept = (request.department != null && !request.department.trim().isEmpty()) ? request.department : user.getDepartment();
        if (dept == null) dept = "M.Tech CSE";
        String normalizedDept = normalizeDepartment(dept);

        LocalDate targetDate = LocalDate.parse(request.date);
        String weekday = getTitleCaseDayOfWeek(targetDate);

        List<TimetableEntry> entries = timetableEntryRepository.findByDepartmentIgnoreCase(normalizedDept);
        List<TimetableEntry> matches = entries.stream()
                .filter(e -> e.getDayOfWeek().equalsIgnoreCase(weekday) 
                        && e.getSubject() != null 
                        && e.getSubject().equalsIgnoreCase("FREE_ACTIVITY"))
                .toList();

        if (matches.isEmpty()) {
            return ResponseEntity.badRequest().body("No Free Activity Period found for " + weekday);
        }

        for (TimetableEntry entry : matches) {
            entry.setActivityName(request.activityName);
            timetableEntryRepository.save(entry);
        }

        // If activity is Coding Practice, link CodingChallenge to CodingQuestionBank ID for that calendar date
        if ("Coding Practice".equalsIgnoreCase(request.activityName)) {
            if (request.questionBankId == null) {
                return ResponseEntity.badRequest().body("Please select a problem from the question bank!");
            }
            Optional<CodingQuestionBank> questionOpt = codingQuestionBankRepository.findById(request.questionBankId);
            if (questionOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Selected question not found in question bank!");
            }

            Optional<CodingChallenge> challengeOpt = codingChallengeRepository.findByDepartmentIgnoreCaseAndDate(normalizedDept, targetDate);
            CodingChallenge challenge;
            if (challengeOpt.isPresent()) {
                challenge = challengeOpt.get();
                challenge.setQuestionBankId(request.questionBankId);
                challenge.setAssignedBy(user.getName());
                challenge.setAssignedDate(LocalDate.now());
            } else {
                challenge = CodingChallenge.builder()
                        .department(normalizedDept)
                        .date(targetDate)
                        .questionBankId(request.questionBankId)
                        .assignedBy(user.getName())
                        .assignedDate(LocalDate.now())
                        .active(true)
                        .build();
            }
            codingChallengeRepository.save(challenge);
        }

        return ResponseEntity.ok("Free Activity Period updated successfully!");
    }

    @GetMapping("/challenge")
    public ResponseEntity<?> getActiveChallenge(
            @RequestParam String date, // "YYYY-MM-DD"
            @RequestParam(required = false) String department,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User user = userOpt.get();

        String dept = (department != null && !department.trim().isEmpty()) ? department : user.getDepartment();
        if (dept == null) dept = "M.Tech CSE";
        String normalizedDept = normalizeDepartment(dept);

        LocalDate targetDate = LocalDate.parse(date);

        Optional<CodingChallenge> challengeOpt = codingChallengeRepository.findByDepartmentIgnoreCaseAndDate(normalizedDept, targetDate);
        CodingChallenge challenge;
        if (challengeOpt.isPresent()) {
            challenge = challengeOpt.get();
        } else {
            // Auto-schedule sequential daily challenge
            List<CodingQuestionBank> allQuestions = codingQuestionBankRepository.findAll();
            if (allQuestions.isEmpty()) {
                return ResponseEntity.badRequest().body("No questions available in the question bank!");
            }
            int index = (int) (Math.abs(targetDate.toEpochDay()) % allQuestions.size());
            CodingQuestionBank question = allQuestions.get(index);

            challenge = CodingChallenge.builder()
                    .department(normalizedDept)
                    .date(targetDate)
                    .questionBankId(question.getId())
                    .assignedBy("System")
                    .assignedDate(LocalDate.now())
                    .active(true)
                    .build();
            codingChallengeRepository.save(challenge);
        }

        Optional<CodingQuestionBank> questionOpt = codingQuestionBankRepository.findById(challenge.getQuestionBankId());
        if (questionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(questionOpt.get());
    }

    public static class RunCodeRequest {
        public String code;
        public String language;
        public Long questionBankId;
    }

    @PostMapping("/run")
    public ResponseEntity<?> runCode(@RequestBody RunCodeRequest request) {
        if (request.questionBankId == null) {
            return ResponseEntity.badRequest().body("No problem selected!");
        }
        Optional<CodingQuestionBank> questionOpt = codingQuestionBankRepository.findById(request.questionBankId);
        if (questionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Selected question not found!");
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, String>> testCases = mapper.readValue(questionOpt.get().getTestCasesJson(), 
                    new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, String>>>() {});
            
            List<Map<String, Object>> results = CodeExecutor.runTestCases(request.language, request.code, testCases);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Execution failed: " + e.getMessage());
        }
    }

    public static class SubmitCodeRequest {
        public String date; // "YYYY-MM-DD"
        public String code;
        public String language;
        public String department;
        public String simulatedDay;
        public String simulatedTime;
    }

    @PostMapping("/submit")
    @Transactional
    public ResponseEntity<?> submitCode(
            @RequestBody SubmitCodeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User user = userOpt.get();

        String dept = (request.department != null && !request.department.trim().isEmpty()) ? request.department : user.getDepartment();
        if (dept == null) dept = "M.Tech CSE";
        String normalizedDept = normalizeDepartment(dept);

        LocalDate submitDate = LocalDate.parse(request.date);

        // Resolve simulated Day and Time
        String simulatedDay = (request.simulatedDay != null && !request.simulatedDay.trim().isEmpty())
                ? request.simulatedDay : getTitleCaseDayOfWeek(submitDate);
        LocalTime simulatedTime = (request.simulatedTime != null && !request.simulatedTime.trim().isEmpty())
                ? LocalTime.parse(request.simulatedTime) : LocalTime.now();

        // 1. Find timetable entry for today's Free Activity Period
        List<TimetableEntry> entries = timetableEntryRepository.findByDepartmentIgnoreCase(normalizedDept);
        TimetableEntry activeFreeEntry = entries.stream()
                .filter(e -> e.getDayOfWeek().equalsIgnoreCase(simulatedDay) 
                        && e.getSubject() != null 
                        && e.getSubject().equalsIgnoreCase("FREE_ACTIVITY"))
                .findFirst().orElse(null);

        // 2. Validate time constraint
        boolean withinPeriod = false;
        PeriodTime pt = null;
        if (activeFreeEntry != null) {
            int periodNo = activeFreeEntry.getPeriod();
            pt = periods.stream().filter(p -> p.number == periodNo).findFirst().orElse(null);
            if (pt != null) {
                withinPeriod = simulatedTime.isAfter(pt.start) && simulatedTime.isBefore(pt.end);
            }
        }

        // 3. Find or auto-schedule the challenge
        Optional<CodingChallenge> challengeOpt = codingChallengeRepository.findByDepartmentIgnoreCaseAndDate(normalizedDept, submitDate);
        CodingChallenge challenge;
        if (challengeOpt.isPresent()) {
            challenge = challengeOpt.get();
        } else {
            List<CodingQuestionBank> allQuestions = codingQuestionBankRepository.findAll();
            if (allQuestions.isEmpty()) return ResponseEntity.badRequest().body("No questions in question bank!");
            int index = (int) (Math.abs(submitDate.toEpochDay()) % allQuestions.size());
            CodingQuestionBank question = allQuestions.get(index);
            challenge = CodingChallenge.builder()
                    .department(normalizedDept)
                    .date(submitDate)
                    .questionBankId(question.getId())
                    .assignedBy("System")
                    .assignedDate(LocalDate.now())
                    .active(true)
                    .build();
            codingChallengeRepository.save(challenge);
        }
        
        Optional<CodingQuestionBank> questionOpt = codingQuestionBankRepository.findById(challenge.getQuestionBankId());
        if (questionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Problem not found in question bank!");
        }
        CodingQuestionBank question = questionOpt.get();

        // 4. Compile and Run code
        boolean allPassed = true;
        List<Map<String, Object>> results = new ArrayList<>();
        int passedCount = 0;
        int totalCount = 0;

        try {
            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, String>> testCases = mapper.readValue(question.getTestCasesJson(), 
                    new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, String>>>() {});
            
            results = CodeExecutor.runTestCases(request.language, request.code, testCases);
            totalCount = results.size();
            for (Map<String, Object> r : results) {
                Boolean passed = (Boolean) r.get("passed");
                if (passed != null && passed) {
                    passedCount++;
                } else {
                    allPassed = false;
                }
            }
        } catch (Exception e) {
            allPassed = false;
        }

        int score = totalCount > 0 ? (passedCount * 100) / totalCount : 0;

        // 5. Get AI Code Review suggestions from Groq
        String reviewSystemPrompt = "You are an expert AI Code Reviewer. " +
                "Review the student's code and provide: 1) Code review feedback, 2) Optimization suggestions, 3) Time complexity explanation, and 4) Coding tips. " +
                "Do NOT evaluate correctness or pass/fail status. Just provide learning and optimization feedback. " +
                "Return ONLY a JSON object with a single string field 'feedback' formatted in clean markdown.";
        
        String reviewUserPrompt = String.format("Problem Title: %s\nLanguage: %s\nStudent Code:\n%s", 
                question.getTitle(), request.language, request.code);
        
        String aiFeedbackResponse = groqService.generateJsonResponse(reviewSystemPrompt, reviewUserPrompt);
        String aiFeedback = "Code reviewed successfully. Good job!";
        try {
            ObjectMapper mapper = new ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(aiFeedbackResponse);
            aiFeedback = (node.path("feedback").isMissingNode() || node.path("feedback").isNull()) ? aiFeedback : node.path("feedback").asText();
        } catch (Exception e) {
            // fallback
        }

        // Save CodingSubmission
        ObjectMapper mapper = new ObjectMapper();
        String testCaseResultsJson = "[]";
        try {
            testCaseResultsJson = mapper.writeValueAsString(results);
        } catch (Exception e) {}

        CodingSubmission submission = CodingSubmission.builder()
                .studentId(user.getId())
                .studentName(user.getName())
                .studentRegisterNumber(user.getRegisterNumber())
                .date(submitDate)
                .subject("FREE_ACTIVITY")
                .problemTitle(question.getTitle())
                .submittedCode(request.code)
                .language(request.language)
                .testCaseResultsJson(testCaseResultsJson)
                .allPassed(allPassed)
                .score(score)
                .aiFeedback(aiFeedback)
                .submittedAt(LocalDateTime.now())
                .build();
        codingSubmissionRepository.save(submission);

        // 6. Update student individual question progress
        Optional<StudentQuestionProgress> progressOpt = studentQuestionProgressRepository.findByStudentIdAndQuestionBankId(user.getId(), question.getId());
        StudentQuestionProgress progress = progressOpt.orElseGet(() -> StudentQuestionProgress.builder()
                .studentId(user.getId())
                .questionBankId(question.getId())
                .passed(false)
                .attempts(0)
                .bestScore(0)
                .build());
        progress.setAttempts(progress.getAttempts() + 1);
        progress.setLastAttempted(LocalDateTime.now());
        if (score > progress.getBestScore()) {
            progress.setBestScore(score);
        }
        if (score >= 75) {
            if (!progress.isPassed()) {
                progress.setPassed(true);
                progress.setSolvedDate(LocalDateTime.now());
                
                // Update aggregate solved stats in CodingProgress:
                Optional<CodingProgress> cpOpt = codingProgressRepository.findByStudent(user);
                CodingProgress cp = cpOpt.orElseGet(() -> CodingProgress.builder()
                        .student(user)
                        .easySolved(0).mediumSolved(0).hardSolved(0).totalSolved(0)
                        .totalAttempted(0).bestScore(0).averageScore(0.0).successRate(0.0)
                        .currentStreak(0).longestStreak(0)
                        .build());
                
                if ("Easy".equalsIgnoreCase(question.getDifficulty())) cp.setEasySolved(cp.getEasySolved() + 1);
                else if ("Medium".equalsIgnoreCase(question.getDifficulty())) cp.setMediumSolved(cp.getMediumSolved() + 1);
                else if ("Hard".equalsIgnoreCase(question.getDifficulty())) cp.setHardSolved(cp.getHardSolved() + 1);
                
                cp.setTotalSolved(cp.getTotalSolved() + 1);
                
                // Streak Logic
                if (cp.getLastUpdated() != null) {
                    LocalDate lastDate = cp.getLastUpdated().toLocalDate();
                    if (lastDate.equals(LocalDate.now().minusDays(1))) {
                        cp.setCurrentStreak(cp.getCurrentStreak() + 1);
                    } else if (!lastDate.equals(LocalDate.now())) {
                        cp.setCurrentStreak(1);
                    }
                } else {
                    cp.setCurrentStreak(1);
                }
                if (cp.getCurrentStreak() > cp.getLongestStreak()) {
                    cp.setLongestStreak(cp.getCurrentStreak());
                }
                cp.setLastUpdated(LocalDateTime.now());
                codingProgressRepository.save(cp);
            }
        }
        studentQuestionProgressRepository.save(progress);

        // Update aggregate attempts stats in CodingProgress:
        Optional<CodingProgress> cpOpt = codingProgressRepository.findByStudent(user);
        if (cpOpt.isPresent()) {
            CodingProgress cp = cpOpt.get();
            cp.setTotalAttempted(cp.getTotalAttempted() + 1);
            if (score > cp.getBestScore()) {
                cp.setBestScore(score);
            }
            List<StudentQuestionProgress> allProgs = studentQuestionProgressRepository.findByStudentId(user.getId());
            double sum = allProgs.stream().mapToInt(StudentQuestionProgress::getBestScore).sum();
            cp.setAverageScore(sum / allProgs.size());
            cp.setSuccessRate((double) cp.getTotalSolved() * 100.0 / cp.getTotalAttempted());
            cp.setLastUpdated(LocalDateTime.now());
            codingProgressRepository.save(cp);
        }

        // 7. Resolve or create Attendance Session for FREE_ACTIVITY today
        Optional<AttendanceSession> activeSessionOpt = attendanceSessionRepository.findByActive(true).stream()
                .filter(s -> s.getSubject().equalsIgnoreCase("FREE_ACTIVITY")).findFirst();
        
        LocalTime startTime = pt != null ? pt.start : LocalTime.of(14,35);
        LocalTime endTime = pt != null ? pt.end : LocalTime.of(15,30);
        
        AttendanceSession sessionToUse;
        if (activeSessionOpt.isPresent()) {
            sessionToUse = activeSessionOpt.get();
        } else {
            sessionToUse = attendanceSessionRepository.findAll().stream()
                    .filter(s -> s.getSubject().equalsIgnoreCase("FREE_ACTIVITY") && s.getStartTime().toLocalDate().equals(submitDate))
                    .findFirst()
                    .orElseGet(() -> {
                        AttendanceSession newS = AttendanceSession.builder()
                                .subject("FREE_ACTIVITY")
                                .facultyId(1L) // System default
                                .startTime(LocalDateTime.of(submitDate, startTime))
                                .expiryTime(LocalDateTime.of(submitDate, endTime))
                                .active(false)
                                .build();
                        return attendanceSessionRepository.save(newS);
                    });
        }

        // Update or insert Attendance (Only if NOT already marked PRESENT)
        Optional<Attendance> attendanceOpt = attendanceRepository.findBySessionIdAndStudentId(sessionToUse.getId(), user.getId());
        boolean alreadyPresent = attendanceOpt.isPresent() && attendanceOpt.get().getStatus().equalsIgnoreCase("PRESENT");

        if (!alreadyPresent) {
            Attendance attendance = attendanceOpt.orElseGet(() -> Attendance.builder()
                    .studentId(user.getId())
                    .sessionId(sessionToUse.getId())
                    .date(submitDate)
                    .time(LocalTime.now())
                    .method("CODING_CHALLENGE")
                    .build());
            
            // Mark Present ONLY if passed >= 75% AND submitted within active period timing
            boolean meetsCriteria = (score >= 75) && withinPeriod;
            attendance.setStatus(meetsCriteria ? "PRESENT" : "PENDING");
            attendance.setRemarks(meetsCriteria ? "Solved challenge within period: " + question.getTitle() : "Attempted coding challenge (FAILED)");
            attendanceRepository.save(attendance);
        }

        return ResponseEntity.ok(submission);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User user = userOpt.get();
        
        List<CodingSubmission> submissions = codingSubmissionRepository.findByStudentId(user.getId());
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/submissions")
    public ResponseEntity<?> getSubmissions(@RequestParam String date, @AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User user = userOpt.get();

        if (user.getRole() != Role.FACULTY && user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("Only faculty or admin can view submissions!");
        }

        LocalDate targetDate = LocalDate.parse(date);
        List<CodingSubmission> submissions = codingSubmissionRepository.findByDate(targetDate);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/progress/list")
    public ResponseEntity<?> getProgressList(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User user = userOpt.get();
        return ResponseEntity.ok(studentQuestionProgressRepository.findByStudentId(user.getId()));
    }

    public static class OverrideAttendanceRequest {
        public Long submissionId;
        public String status; // PRESENT or ABSENT
    }

    @PostMapping("/override-attendance")
    @Transactional
    public ResponseEntity<?> overrideAttendance(
            @RequestBody OverrideAttendanceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found!");
        User user = userOpt.get();

        if (user.getRole() != Role.FACULTY && user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("Only faculty or admin can override attendance!");
        }

        Optional<CodingSubmission> subOpt = codingSubmissionRepository.findById(request.submissionId);
        if (subOpt.isEmpty()) return ResponseEntity.badRequest().body("Submission not found!");
        CodingSubmission sub = subOpt.get();

        // Update attendance
        Optional<AttendanceSession> sessionOpt = attendanceSessionRepository.findAll().stream()
                .filter(s -> s.getSubject().equalsIgnoreCase("FREE_ACTIVITY") && s.getStartTime().toLocalDate().equals(sub.getDate()))
                .findFirst();

        if (sessionOpt.isPresent()) {
            Attendance attendance = attendanceRepository.findBySessionIdAndStudentId(sessionOpt.get().getId(), sub.getStudentId())
                    .orElseGet(() -> Attendance.builder()
                            .studentId(sub.getStudentId())
                            .sessionId(sessionOpt.get().getId())
                            .date(sub.getDate())
                            .time(LocalTime.now())
                            .method("MANUAL")
                            .build());

            attendance.setStatus(request.status.toUpperCase());
            attendance.setRemarks("Override by Faculty: " + user.getName());
            attendanceRepository.save(attendance);
        }

        return ResponseEntity.ok("Attendance overridden successfully!");
    }

    private String normalizeDepartment(String dept) {
        if (dept == null) return "M.Tech CSE";
        String lower = dept.toLowerCase();
        if (lower.contains("m") && lower.contains("tech") && lower.contains("cse")) return "M.Tech CSE";
        if (lower.contains("b") && lower.contains("tech") && lower.contains("it")) return "IT";
        if (lower.contains("cse")) return "CSE";
        if (lower.contains("ece")) return "ECE";
        return dept;
    }

    private String getTitleCaseDayOfWeek(LocalDate date) {
        String day = date.getDayOfWeek().name();
        return day.substring(0, 1).toUpperCase() + day.substring(1).toLowerCase();
    }
}
