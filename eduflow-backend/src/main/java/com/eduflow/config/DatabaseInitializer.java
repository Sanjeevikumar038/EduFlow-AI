package com.eduflow.config;

import com.eduflow.controller.AdminController;
import com.eduflow.entity.*;
import com.eduflow.repository.*;
import com.eduflow.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.transaction.annotation.Transactional;
import java.io.File;

import java.time.*;
import java.util.*;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private TimetableEntryRepository timetableEntryRepository;
    @Autowired private SubjectMasterRepository subjectMasterRepository;
    @Autowired private FacultyExpertiseRepository facultyExpertiseRepository;
    @Autowired private TimetableVersionRepository timetableVersionRepository;
    @Autowired private ClassroomRepository classroomRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AuthService authService;
    @Autowired private AttendanceSessionRepository attendanceSessionRepository;
    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private InterviewAttemptRepository interviewAttemptRepository;
    @Autowired private InterviewDomainRepository interviewDomainRepository;
    @Autowired private CodingProgressRepository codingProgressRepository;
    @Autowired private CareerHistoryRepository careerHistoryRepository;
    @Autowired private FacultyAvailabilityRepository facultyAvailabilityRepository;
    @Autowired private StudentProfileRepository studentProfileRepository;
    @Autowired private ResumeRepository resumeRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private InterviewSessionRepository interviewSessionRepository;
    @Autowired private InterviewResultRepository interviewResultRepository;
    @Autowired private InterviewResponseRepository interviewResponseRepository;
    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    @Autowired private CodingChallengeRepository codingChallengeRepository;
    @Autowired private CodingQuestionBankRepository codingQuestionBankRepository;
    @Autowired private FacultyWorkloadAllocationRepository allocationRepository;
    @Autowired private com.eduflow.service.AiWorkloadOptimizerService aiWorkloadOptimizerService;

    private boolean tableExists(String tableName) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ?",
                Integer.class, tableName
            );
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }

    private void safeExecuteIfTableExists(String tableName, String sql) {
        if (tableExists(tableName)) {
            try {
                jdbcTemplate.execute(sql);
            } catch (Exception ignored) {}
        }
    }

    private void ensureColumnsExist() {
        if (tableExists("subject_master")) {
            try {
                jdbcTemplate.execute("ALTER TABLE subject_master DROP CONSTRAINT IF EXISTS subject_master_subject_code_key");
                jdbcTemplate.execute("ALTER TABLE subject_master DROP CONSTRAINT IF EXISTS uk_subject_code");
                jdbcTemplate.execute("ALTER TABLE subject_master DROP CONSTRAINT IF EXISTS uk_subject_master_subject_code");
            } catch (Exception ignored) {}
        }
        if (tableExists("users")) {
            try {
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS active boolean DEFAULT true");
            } catch (Exception e) {
                try {
                    jdbcTemplate.execute("ALTER TABLE users ADD COLUMN active boolean DEFAULT true");
                } catch (Exception ex) {
                    // Ignore if it already exists or on other DB dialects
                }
            }
            try {
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS class_advisor boolean DEFAULT false");
            } catch (Exception e) {
                try {
                    jdbcTemplate.execute("ALTER TABLE users ADD COLUMN class_advisor boolean DEFAULT false");
                } catch (Exception ex) {
                    // Ignore if it already exists or on other DB dialects
                }
            }
        }
    }


    @Override
    @Transactional
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE faculty_workload_allocations DROP CONSTRAINT IF EXISTS uk1q4uutb0v2hc7r5wr4cwdidre;");
        } catch (Exception ignored) {}
        // Extract 100 questions JSON from logs if not exists
        try {
            File jsonFile = new File("src/main/resources/coding_questions_bank.json");
            if (!jsonFile.exists()) {
                System.out.println("--- Extracting 100 questions JSON from logs... ---");
                File logFile = new File("C:/Users/sanje/.gemini/antigravity-ide/brain/b082f50b-5a0c-499e-a1a8-602051200dcf/.system_generated/logs/transcript_full.jsonl");
                if (logFile.exists()) {
                    java.util.List<String> lines = java.nio.file.Files.readAllLines(logFile.toPath());
                    String jsonBlock = null;
                    for (String line : lines) {
                        if (line.contains("Two Sum") && line.contains("Palindrome Number") && !line.contains("ex.getMessage()")) {
                            try {
                                ObjectMapper mapper = new ObjectMapper();
                                Map<String, Object> logObj = mapper.readValue(line, Map.class);
                                String content = (String) logObj.get("content");
                                if (content != null) {
                                    int startIdx = content.indexOf("[");
                                    int endIdx = content.lastIndexOf("]");
                                    if (startIdx != -1 && endIdx != -1 && endIdx > startIdx) {
                                        String rawJson = content.substring(startIdx, endIdx + 1).trim();
                                        try {
                                            List<Object> temp = mapper.readValue(rawJson, List.class);
                                            // Ensure we actually got a list of questions (e.g. at least 30, up to 100)
                                            if (temp.size() >= 30) {
                                                System.out.println("--- Successfully parsed " + temp.size() + " questions from log content! ---");
                                                jsonBlock = rawJson;
                                                break;
                                            }
                                        } catch (Exception ex) {
                                            // try another line if parsing this substring fails
                                        }
                                    }
                                }
                            } catch (Exception ex) {
                                // ignore parse errors on invalid lines
                            }
                        }
                    }
                    if (jsonBlock != null) {
                        jsonFile.getParentFile().mkdirs();
                        java.nio.file.Files.writeString(jsonFile.toPath(), jsonBlock);
                        System.out.println("--- Saved coding_questions_bank.json successfully! ---");
                    } else {
                        System.out.println("--- ERROR: 'Two Sum' block with a valid JSON array not found in logs! ---");
                    }
                } else {
                    System.out.println("--- ERROR: Log file does not exist at path: " + logFile.getAbsolutePath() + " ---");
                }
            } else {
                System.out.println("--- coding_questions_bank.json already exists, skipping extraction. ---");
            }
        } catch (Exception e) {
            System.out.println("Error during logs extraction: " + e.getMessage());
            e.printStackTrace();
        }

        ensureColumnsExist();
        
        // ── Safe Cascade Purge for all legacy mock faculty & demo subjects ──
        try {
            System.out.println("--- EXECUTING CASCADE PURGE OF ALL MOCK FACULTY & DEMO ACADEMIC DATA ---");
            List<String> mockEmails = List.of("vimit@skcet.ac.in", "sreeraj@skcet.ac.in", "divya@skcet.ac.in", "pradeep@skcet.ac.in");
            for (String email : mockEmails) {
                userRepository.findByEmail(email).ifPresent(u -> {
                    Long uId = u.getId();
                    safeExecuteIfTableExists("classroom_announcements", "DELETE FROM classroom_announcements WHERE classroom_id IN (SELECT id FROM course_classrooms WHERE faculty_id = " + uId + ")");
                    safeExecuteIfTableExists("classroom_materials", "DELETE FROM classroom_materials WHERE classroom_id IN (SELECT id FROM course_classrooms WHERE faculty_id = " + uId + ")");
                    safeExecuteIfTableExists("classroom_assignments", "DELETE FROM classroom_assignments WHERE classroom_id IN (SELECT id FROM course_classrooms WHERE faculty_id = " + uId + ")");
                    safeExecuteIfTableExists("classroom_assessments", "DELETE FROM classroom_assessments WHERE classroom_id IN (SELECT id FROM course_classrooms WHERE faculty_id = " + uId + ")");
                    safeExecuteIfTableExists("classroom_lecture_history", "DELETE FROM classroom_lecture_history WHERE classroom_id IN (SELECT id FROM course_classrooms WHERE faculty_id = " + uId + ")");
                    safeExecuteIfTableExists("course_classrooms", "DELETE FROM course_classrooms WHERE faculty_id = " + uId);
                    safeExecuteIfTableExists("timetable_entries", "UPDATE timetable_entries SET faculty_id = NULL WHERE faculty_id = " + uId);
                    try { facultyExpertiseRepository.deleteByFacultyId(uId); } catch (Exception ignored) {}
                    try { userRepository.delete(u); } catch (Exception ignored) {}
                });
            }
            List<String> mockCodes = List.of("AGAI", "DTF", "SE", "DCN");
            for (String code : mockCodes) {
                try {
                    subjectMasterRepository.findBySubjectCodeIgnoreCase(code).ifPresent(subjectMasterRepository::delete);
                } catch (Exception ignored) {}
            }
            System.out.println("--- PURGE OF MOCK FACULTY & DEMO ACADEMIC DATA COMPLETED SUCCESSFULLY ---");
        } catch (Exception e) {
            System.out.println("--- Purge Info: " + e.getMessage() + " ---");
        }

        // ─── Custom M.Tech CSE Role/Workflow Seeding ──────────────
        initializeMtechCseRoleWorkflow();

        // ─── Admin ───────────────────────────────────────────────
        if (userRepository.findByEmail("admin").isEmpty()) {
            userRepository.save(User.builder()
                    .name("System Administrator").email("admin")
                    .password(passwordEncoder.encode("admin@123"))
                    .role(Role.ADMIN).build());
            System.out.println("--- Admin Initialized: admin / admin@123 ---");
        }

        // ─── Faculty & Students (Other Departments) ─────────────────
        String[] depts = {"CSE", "IT", "ECE"};
        String standardPassword = passwordEncoder.encode("123456");

        String[][] facultyNames = {
            {"Dr. Suresh Babu", "Dr. Meenakshi S", "Dr. Rajesh K", "Dr. Deepak N", "Dr. Hariharan P"},
            {"Dr. Venkatesh R", "Dr. Lakshmi Priya", "Dr. Saravanan M", "Dr. Kavitha B", "Dr. Dinesh Kumar"},
            {"Dr. Ravichandran S", "Dr. Anuradha K", "Dr. Murugan T", "Dr. Gayathri R", "Dr. Senthil Kumar"}
        };

        String[][] studentNames = {
            {"Abhishek R", "Bhavana K", "Charan Raj", "Deepika S", "Eshwar Prasad"},
            {"Gokul Raj", "Harish Kumar", "Indhuja M", "Jeevan Anand", "Kavya Shree"},
            {"Manoj Kumar", "Nisha Dev", "Oviya Murthy", "Pranav R", "Ramya Krishnan"}
        };

        // Seed students if no student accounts exist in database
        System.out.println("--- Student Module Planning: Using in-memory 60 students/section assumption (Zero DB mock student records created) ---");

        // Seed real SKCET faculty members if missing
        List<User> seedFacultyList = List.of(
            User.builder().name("Dr. Emmanuel Joy").email("emmanuel@skcet.ac.in").password(standardPassword).role(Role.FACULTY).department("Department of MTech Computer Science and Engineering").active(true).build(),
            User.builder().name("Ms Evangelin Arockiya Sherly C").email("evangelinarockiyashe@skcet.ac.in").password(standardPassword).role(Role.FACULTY).department("Department of Artificial Intelligence and Data Science").active(true).build(),
            User.builder().name("Dr.VIMALA K").email("vimalak@skcet.ac.in").password(standardPassword).role(Role.FACULTY).department("Department of Artificial Intelligence and Data Science").active(true).build(),
            User.builder().name("Dr ARUN KUMAR RAJENDRAN").email("arunkumarrajenan@skcet.ac.in").password(standardPassword).role(Role.FACULTY).department("Department of Artificial Intelligence and Data Science").active(true).build(),
            User.builder().name("Mr VIMIT VARGHESE M").email("vimvarghesem@skcet.ac.in").password(standardPassword).role(Role.FACULTY).department("Department of MTech Computer Science and Engineering").active(true).build(),
            User.builder().name("Dr. SREERAJ R").email("sreerajr@skcet.ac.in").password(standardPassword).role(Role.FACULTY).department("Department of MTech Computer Science and Engineering").active(true).build(),
            User.builder().name("Dr. DIVYA P").email("divyap@skcet.ac.in").password(standardPassword).role(Role.FACULTY).department("Department of MTech Computer Science and Engineering").active(true).build(),
            User.builder().name("Mr. PRADEEP KUMAR R").email("pradeepkumarr@skcet.ac.in").password(standardPassword).role(Role.FACULTY).department("Department of MTech Computer Science and Engineering").active(true).build(),
            User.builder().name("Dr. MEENAKSHI S").email("meenakshis@skcet.ac.in").password(standardPassword).role(Role.FACULTY).department("Department of Computer Science and Engineering").active(true).build(),
            User.builder().name("Dr. SURESH BABU K").email("sureshbabuk@skcet.ac.in").password(standardPassword).role(Role.FACULTY).department("Department of Computer Science and Engineering").active(true).build(),
            User.builder().name("Dr. RAJESH K").email("rajeshk@skcet.ac.in").password(standardPassword).role(Role.FACULTY).department("Department of Information Technology").active(true).build()
        );

        for (User f : seedFacultyList) {
            if (userRepository.findByEmail(f.getEmail()).isEmpty()) {
                userRepository.save(f);
            }
        }



        // Identify and mark non-teaching Department HODs
        Set<String> hodIds = Set.of(
            "AIDS001", "CIVIL001", "CSE001", "GEN001", "GEN007",
            "GEN015", "EEE001", "ECE001", "IT001", "MECH001",
            "GEN022", "CSE040", "SH001", "MBA001", "GEN050"
        );

        Set<String> hodNames = Set.of(
            "arun kumar rajendran", "maruthachalam", "kousalya", "ramesh kumar", "sanmuga priya",
            "palani subramanian", "ramya", "sharmila", "senthilnathan", "sundararaj",
            "lydia", "reshma v k", "indhuleka", "jaisankar", "jinsha"
        );

        String pwd123456 = passwordEncoder.encode("123456");

        userRepository.findAll().forEach(u -> {
            boolean changed = false;
            if (u.getRole() == Role.FACULTY || u.getRole() == Role.STUDENT) {
                u.setPassword(pwd123456);
                changed = true;
            }
            if (u.getDepartment() != null) {
                String norm = AdminController.normalizeDepartment(u.getDepartment());
                if (!norm.equals(u.getDepartment())) {
                    u.setDepartment(norm);
                    changed = true;
                }
            }
            if (u.getRole() == Role.FACULTY) {
                String reg = u.getRegisterNumber() != null ? u.getRegisterNumber().toUpperCase() : "";
                String nameLower = u.getName() != null ? u.getName().toLowerCase() : "";
                boolean isHodMatch = hodIds.contains(reg) || hodNames.stream().anyMatch(nameLower::contains);
                if (isHodMatch && !u.isHod()) {
                    u.setHod(true);
                    changed = true;
                }
            }
            if (changed) {
                userRepository.save(u);
            }
        });

        authService.initializeEmptyRegisterNumbers();
        System.out.println("--- Faculty, Students, HODs & Register Numbers Initialized (Passwords set to 123456) ---");

        // ─── Classrooms ──────────────────────────────────────────
        if (classroomRepository.count() == 0) {
            List<Classroom> rooms = List.of(
                Classroom.builder().roomCode("CS101").roomName("CS Lecture Hall A").capacity(60).roomType("LECTURE").build(),
                Classroom.builder().roomCode("CS102").roomName("CS Lecture Hall B").capacity(60).roomType("LECTURE").build(),
                Classroom.builder().roomCode("CSLAB1").roomName("CS Lab 1").capacity(30).roomType("LAB").build(),
                Classroom.builder().roomCode("CSLAB2").roomName("CS Lab 2").capacity(30).roomType("LAB").build(),
                Classroom.builder().roomCode("IT101").roomName("IT Lecture Hall").capacity(60).roomType("LECTURE").build(),
                Classroom.builder().roomCode("ITLAB1").roomName("IT Lab").capacity(30).roomType("LAB").build(),
                Classroom.builder().roomCode("ECE101").roomName("ECE Lecture Hall").capacity(60).roomType("LECTURE").build(),
                Classroom.builder().roomCode("ECELAB1").roomName("ECE Lab").capacity(30).roomType("LAB").build(),
                Classroom.builder().roomCode("SEM1").roomName("Seminar Hall 1").capacity(120).roomType("SEMINAR").build()
            );
            classroomRepository.saveAll(rooms);
            System.out.println("--- Classrooms Initialized ---");
        }

        // ─── Startup Data Preservation Notice ───
        // Automatic database purge of subject_master removed to preserve user-imported subject master records across server restarts.

        // ─── Timetable Versions & Timetables ─────────────────────
        if (timetableVersionRepository.count() == 0) {
            String ay = "2024-25";
            // Create active versions per dept
            TimetableVersion v2 = timetableVersionRepository.save(TimetableVersion.builder().department("CSE").semester(3).academicYear(ay).versionName("Odd Semester 2024").active(true).build());
            TimetableVersion v3 = timetableVersionRepository.save(TimetableVersion.builder().department("IT").semester(3).academicYear(ay).versionName("Odd Semester 2024").active(true).build());
            TimetableVersion v4 = timetableVersionRepository.save(TimetableVersion.builder().department("ECE").semester(3).academicYear(ay).versionName("Odd Semester 2024").active(true).build());

            String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"};
            Random random = new Random(42); // deterministic seed

            seedTimetable(v2, days, new String[]{"DSA","COA","DBMS","TOC","Java Lab","DSA","COA","DBMS"}, random);
            seedTimetable(v3, days, new String[]{"OOPs","WebTech","Cloud","Web Lab","OOPs","WebTech","Cloud","Web Lab"}, random);
            seedTimetable(v4, days, new String[]{"EDC","DSP","VLSI","Embedded Lab","EDC","DSP","VLSI","EDC"}, random);

            System.out.println("--- Timetable Versions & Entries Initialized ---");
        }

        // Trigger Initial Live Workload Generation Pass
        try {
            if (allocationRepository.count() == 0) {
                System.out.println("--- Triggering Initial Live Workload Generation Pass ---");
                com.eduflow.dto.AiSmartAllocationRequest req = new com.eduflow.dto.AiSmartAllocationRequest();
                req.setAcademicYear("2026-2027");
                req.setSemesterType("Odd");
                req.setVersionName("v1");
                aiWorkloadOptimizerService.generateSmartWorkloadAllocation(req);
                System.out.println("--- Initial Live Workload Draft 'v1' Generated Successfully ---");
            }
        } catch (Exception e) {
            System.err.println("--- Initial Workload Generation Note: " + e.getMessage() + " ---");
        }
    }

    private void assignExpertise(String email, List<String> subjectCodes,
                                  ExpertiseLevel level, Map<String, SubjectMaster> subjectMap) {
        userRepository.findByEmail(email).ifPresent(faculty ->
            subjectCodes.forEach(code -> {
                SubjectMaster subject = subjectMap.get(code);
                if (subject != null && !facultyExpertiseRepository.existsByFacultyIdAndSubjectId(faculty.getId(), subject.getId())) {
                    facultyExpertiseRepository.save(FacultyExpertise.builder()
                            .faculty(faculty).subject(subject).expertiseLevel(level).build());
                }
            })
        );
    }

    /**
     * Retrieve an existing SubjectMaster by subject code (case‑insensitive) or create a new one.
     * This makes the seeding process idempotent and prevents duplicate‑key violations.
     */
    private SubjectMaster getOrCreateSubject(String code, String name, String department) {
        return subjectMasterRepository.findBySubjectCodeIgnoreCase(code)
                .orElseGet(() -> subjectMasterRepository.save(
                        SubjectMaster.builder()
                                .subjectCode(code)
                                .subjectName(name)
                                .department(department)
                                .semester(8)
                                .academicYear("2024-25")
                                .credits(code.equalsIgnoreCase("DCN") ? 4 : 3)
                                .weeklyHours(code.equalsIgnoreCase("DCN") ? 4 : 3)
                                .subjectCategory(code.equalsIgnoreCase("AGAI") ? SubjectCategory.ELECTIVE : SubjectCategory.THEORY)
                                .build()));
    }

    private void seedTimetable(TimetableVersion version, String[] days, String[] subjects, Random random) {
        // Get faculty with expertise in these subjects
        List<User> allFaculty = userRepository.findByRole(Role.FACULTY);
        for (String day : days) {
            for (int p = 1; p <= 8; p++) {
                String sub = subjects[random.nextInt(subjects.length)];
                // Find faculty who have expertise in this subject (PRIMARY preferred)
                SubjectMaster subjectMaster = subjectMasterRepository.findBySubjectCodeIgnoreCase(sub).orElse(null);
                User assignedFaculty = null;
                if (subjectMaster != null) {
                    List<FacultyExpertise> experts = facultyExpertiseRepository.findBySubjectId(subjectMaster.getId());
                    List<FacultyExpertise> primary = experts.stream()
                            .filter(e -> e.getExpertiseLevel() == ExpertiseLevel.PRIMARY).toList();
                    List<FacultyExpertise> chosen = primary.isEmpty() ? experts : primary;
                    if (!chosen.isEmpty()) {
                        assignedFaculty = chosen.get(random.nextInt(chosen.size())).getFaculty();
                    }
                }
                if (assignedFaculty == null && !allFaculty.isEmpty()) {
                    assignedFaculty = allFaculty.get(random.nextInt(allFaculty.size()));
                }
                if (p == 8) {
                    timetableEntryRepository.save(TimetableEntry.builder()
                            .department(version.getDepartment())
                            .dayOfWeek(day).period(p).subject("FREE_ACTIVITY")
                            .activityName("Research & Innovation")
                            .faculty(null).version(version)
                            .semester(version.getSemester()).academicYear(version.getAcademicYear())
                            .build());
                } else {
                    timetableEntryRepository.save(TimetableEntry.builder()
                            .department(version.getDepartment())
                            .dayOfWeek(day).period(p).subject(sub)
                            .faculty(assignedFaculty).version(version)
                            .semester(version.getSemester()).academicYear(version.getAcademicYear())
                            .build());
                }
            }
        }
    }

    @Transactional
    public void initializeMtechCseRoleWorkflow() throws Exception {
        String standardPassword = passwordEncoder.encode("123456");

        // Parse and seed the 63 students from mtech_cse_students.json
        ObjectMapper mapper = new ObjectMapper();
        File file = new File("../mtech_cse_students.json");
        if (!file.exists()) {
            file = new File("mtech_cse_students.json");
        }
        if (!file.exists()) {
            file = new File("C:/Users/sanje/Downloads/PROJECTS/EduFlow/mtech_cse_students.json");
        }
        if (file.exists()) {
            Map<String, Object> root = mapper.readValue(file, Map.class);
            List<Map<String, Object>> studentList = (List<Map<String, Object>>) root.get("students");
            for (Map<String, Object> data : studentList) {
                String roll = (String) data.get("roll_number");
                String name = (String) data.get("name");
                String email = (String) data.get("email");
                String phone = (String) data.get("phone");
                String batch = (String) data.get("batch");
                String section = (String) data.get("section");
                String dob = (String) data.get("date_of_birth");
                String gender = (String) data.get("gender");
                String address = (String) data.get("address");

                Optional<User> existingStudentOpt = userRepository.findByEmail(email);
                User student;
                if (existingStudentOpt.isPresent()) {
                    student = existingStudentOpt.get();
                    student.setName(name);
                    student.setRegisterNumber(roll);
                    student.setDepartment("M.Tech CSE");
                    student.setPhone(phone);
                    student.setBatch(batch);
                    student.setSection(section);
                    student.setSemester(7);
                    student.setYear("4");
                    student.setDateOfBirth(dob);
                    student.setGender(gender);
                    student.setAddress(address);
                } else {
                    student = User.builder()
                            .name(name)
                            .email(email)
                            .password(standardPassword)
                            .role(Role.STUDENT)
                            .registerNumber(roll)
                            .department("M.Tech CSE")
                            .phone(phone)
                            .batch(batch)
                            .section(section)
                            .semester(7)
                            .year("4")
                            .dateOfBirth(dob)
                            .gender(gender)
                            .address(address)
                            .active(true)
                            .build();
                }

                userRepository.save(student);

                if (studentProfileRepository.findByUserId(student.getId()).isEmpty()) {
                    StudentProfile profile = StudentProfile.builder().user(student).build();
                    studentProfileRepository.save(profile);
                }
            }

            // Ensure all 727723EUCI students are updated to Semester 7 & Year 4
            List<User> cseStudents = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.STUDENT && u.getRegisterNumber() != null && u.getRegisterNumber().toUpperCase().startsWith("727723EUCI"))
                    .collect(java.util.stream.Collectors.toList());
            for (User u : cseStudents) {
                u.setSemester(7);
                u.setYear("4");
                userRepository.save(u);
            }

            System.out.println("--- Imported & updated " + cseStudents.size() + " M.Tech CSE (727723EUCI) 4th Year students to Semester 7 ---");
        } else {
            System.out.println("--- ERROR: mtech_cse_students.json file not found! ---");
        }

        // Ensure active student SANJEEVIKUMAR D exists in the database
        Optional<User> existingUserOpt = userRepository.findByEmail("727723euci045@skcet.ac.in");
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            existingUser.setRegisterNumber("727723EUCI045");
            existingUser.setName("SANJEEVIKUMAR D");
            existingUser.setDepartment("M.Tech CSE");
            existingUser.setSemester(7);
            existingUser.setYear("4");
            existingUser.setRole(Role.STUDENT);
            userRepository.save(existingUser);
            // Ensure student profile exists too
            if (studentProfileRepository.findByUserId(existingUser.getId()).isEmpty()) {
                studentProfileRepository.save(StudentProfile.builder().user(existingUser).build());
            }
        } else {
            System.out.println("--- Seeding active user SANJEEVIKUMAR D ---");
            User student = User.builder()
                    .name("SANJEEVIKUMAR D")
                    .email("727723euci045@skcet.ac.in")
                    .password(standardPassword)
                    .role(Role.STUDENT)
                    .registerNumber("727723EUCI045")
                    .department("M.Tech CSE")
                    .phone("9965522570")
                    .batch("2023-2025")
                    .section("A")
                    .semester(7)
                    .year("4")
                    .dateOfBirth("2005-12-12")
                    .gender("Male")
                    .address("SKCET Coimbatore")
                    .active(true)
                    .build();
            userRepository.save(student);
            StudentProfile profile = StudentProfile.builder().user(student).build();
            studentProfileRepository.save(profile);
        }

        if (interviewDomainRepository.count() == 0) {
            List<InterviewDomain> domains = List.of(
                InterviewDomain.builder().name("Software Engineering").description("Core OOP, Data Structures, Algorithms & Clean Architecture").isActive(true).build(),
                InterviewDomain.builder().name("Full Stack Web Development").description("React, Node.js, Spring Boot, REST APIs & Databases").isActive(true).build(),
                InterviewDomain.builder().name("Data Science & AI").description("Python, Machine Learning, Neural Networks & Data Analytics").isActive(true).build(),
                InterviewDomain.builder().name("Cloud & DevOps Engineering").description("Docker, Kubernetes, AWS Services & CI/CD Pipelines").isActive(true).build(),
                InterviewDomain.builder().name("System Design & Architecture").description("Scalable Architectures, Microservices, Caching & Load Balancing").isActive(true).build()
            );
            interviewDomainRepository.saveAll(domains);
            System.out.println("--- Seeded 5 AI Interview Domains ---");
        }




        try {
            mapper = new ObjectMapper();
            File jsonFile = new File("src/main/resources/coding_questions_bank.json");
            if (jsonFile.exists() && codingQuestionBankRepository.count() < 7) {
                System.out.println("--- Seeding Coding Question Bank from JSON... ---");
                codingQuestionBankRepository.deleteAll();
                List<Map<String, Object>> questionsList = mapper.readValue(jsonFile, List.class);
                for (Map<String, Object> qData : questionsList) {
                    Map<String, String> boilerplates = (Map<String, String>) qData.get("boilerplates");
                    
                    CodingQuestionBank question = CodingQuestionBank.builder()
                            .title((String) qData.get("title"))
                            .description((String) qData.get("description"))
                            .difficulty((String) qData.get("difficulty"))
                            .category((String) qData.get("topic")) // map topic -> category
                            .tags((String) qData.get("topic"))
                            .constraints("Constraints not specified.")
                            .sampleInput((String) qData.get("sample_input"))
                            .sampleOutput((String) qData.get("sample_output"))
                            .explanation("Sample explanation not specified.")
                            .boilerplateJava(boilerplates != null ? boilerplates.get("java") : "")
                            .boilerplatePython(boilerplates != null ? boilerplates.get("python") : "")
                            .boilerplateCpp(boilerplates != null ? boilerplates.get("cpp") : "")
                            .boilerplateC(boilerplates != null ? boilerplates.get("c") : "")
                            .testCasesJson(mapper.writeValueAsString(qData.get("hidden_test_cases")))
                            .timeLimit(1000)
                            .memoryLimit(256)
                            .createdBy("System")
                            .active(true)
                            .build();
                    codingQuestionBankRepository.save(question);
                }
                System.out.println("--- Seeding of " + questionsList.size() + " questions complete! ---");
            } else {
                System.out.println("--- Coding Question Bank already seeded or JSON file missing. count: " 
                        + codingQuestionBankRepository.count() + " ---");
            }
        } catch (Exception e) {
            System.out.println("Error seeding question bank: " + e.getMessage());
            e.printStackTrace();
        }

        System.out.println("--- Seeded 6-period M.Tech CSE Semester 8 Timetable ---");
    }
}
