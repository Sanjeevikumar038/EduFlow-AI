package com.eduflow.config;

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

    private void ensureColumnsExist() {
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

    @Override
    @Transactional
    public void run(String... args) throws Exception {
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
            {"Dr. Suresh Babu", "Dr. Meenakshi S", "Dr. Rajesh K", "Dr. Divya N", "Dr. Hariharan P"},
            {"Dr. Venkatesh R", "Dr. Lakshmi Priya", "Dr. Saravanan M", "Dr. Kavitha B", "Dr. Dinesh Kumar"},
            {"Dr. Ravichandran S", "Dr. Anuradha K", "Dr. Murugan T", "Dr. Gayathri R", "Dr. Senthil Kumar"}
        };

        String[][] studentNames = {
            {"Abhishek R", "Bhavana K", "Charan Raj", "Deepika S", "Eshwar Prasad"},
            {"Gokul Raj", "Harish Kumar", "Indhuja M", "Jeevan Anand", "Kavya Shree"},
            {"Manoj Kumar", "Nisha Dev", "Oviya Murthy", "Pranav R", "Ramya Krishnan"}
        };

        for (int d = 0; d < depts.length; d++) {
            String dept = depts[d];
            String deptPrefix = dept.toLowerCase().replaceAll("[^a-z]", "");
            for (int i = 1; i <= 5; i++) {
                String email = deptPrefix + "_fac" + i + "@eduflow.com";
                User faculty = userRepository.findByEmail(email).orElse(null);
                if (faculty == null) {
                    faculty = User.builder().name(facultyNames[d][i - 1]).email(email)
                            .password(standardPassword).role(Role.FACULTY).department(dept).build();
                } else {
                    faculty.setName(facultyNames[d][i - 1]);
                    faculty.setPassword(standardPassword);
                }
                userRepository.save(faculty);
            }
            for (int i = 1; i <= 5; i++) {
                String email = deptPrefix + "_stud" + i + "@eduflow.com";
                User student = userRepository.findByEmail(email).orElse(null);
                if (student == null) {
                    student = User.builder().name(studentNames[d][i - 1]).email(email)
                            .password(standardPassword).role(Role.STUDENT).department(dept).build();
                } else {
                    student.setName(studentNames[d][i - 1]);
                    student.setPassword(standardPassword);
                }
                userRepository.save(student);
            }
        }
        authService.initializeEmptyRegisterNumbers();
        System.out.println("--- Faculty, Students & Register Numbers Initialized ---");

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

        // ─── Subject Master ───────────────────────────────────────
        if (subjectMasterRepository.count() == 0) {
            List<SubjectMaster> subjects = new ArrayList<>();
            // CSE
            subjects.add(SubjectMaster.builder().subjectCode("DSA").subjectName("Data Structures & Algorithms").department("CSE").semester(3).academicYear("2024-25").credits(4).weeklyHours(4).subjectCategory(SubjectCategory.THEORY).build());
            subjects.add(SubjectMaster.builder().subjectCode("COA").subjectName("Computer Organization & Architecture").department("CSE").semester(3).academicYear("2024-25").credits(4).weeklyHours(4).subjectCategory(SubjectCategory.THEORY).build());
            subjects.add(SubjectMaster.builder().subjectCode("DBMS").subjectName("Database Management Systems").department("CSE").semester(3).academicYear("2024-25").credits(3).weeklyHours(3).subjectCategory(SubjectCategory.THEORY).build());
            subjects.add(SubjectMaster.builder().subjectCode("TOC").subjectName("Theory of Computation").department("CSE").semester(3).academicYear("2024-25").credits(3).weeklyHours(3).subjectCategory(SubjectCategory.THEORY).build());
            subjects.add(SubjectMaster.builder().subjectCode("Java Lab").subjectName("Java Programming Lab").department("CSE").semester(3).academicYear("2024-25").credits(2).weeklyHours(4).subjectCategory(SubjectCategory.LAB).build());
            // IT
            subjects.add(SubjectMaster.builder().subjectCode("OOPs").subjectName("Object Oriented Programming").department("IT").semester(3).academicYear("2024-25").credits(4).weeklyHours(4).subjectCategory(SubjectCategory.THEORY).build());
            subjects.add(SubjectMaster.builder().subjectCode("WebTech").subjectName("Web Technologies").department("IT").semester(3).academicYear("2024-25").credits(3).weeklyHours(3).subjectCategory(SubjectCategory.THEORY).build());
            subjects.add(SubjectMaster.builder().subjectCode("Cloud").subjectName("Cloud Computing").department("IT").semester(3).academicYear("2024-25").credits(3).weeklyHours(3).subjectCategory(SubjectCategory.THEORY).build());
            subjects.add(SubjectMaster.builder().subjectCode("Web Lab").subjectName("Web Development Lab").department("IT").semester(3).academicYear("2024-25").credits(2).weeklyHours(4).subjectCategory(SubjectCategory.LAB).build());
            // ECE
            subjects.add(SubjectMaster.builder().subjectCode("EDC").subjectName("Electronic Devices & Circuits").department("ECE").semester(3).academicYear("2024-25").credits(4).weeklyHours(4).subjectCategory(SubjectCategory.THEORY).build());
            subjects.add(SubjectMaster.builder().subjectCode("DSP").subjectName("Digital Signal Processing").department("ECE").semester(3).academicYear("2024-25").credits(4).weeklyHours(4).subjectCategory(SubjectCategory.THEORY).build());
            subjects.add(SubjectMaster.builder().subjectCode("VLSI").subjectName("VLSI Design").department("ECE").semester(3).academicYear("2024-25").credits(3).weeklyHours(3).subjectCategory(SubjectCategory.THEORY).build());
            subjects.add(SubjectMaster.builder().subjectCode("Embedded Lab").subjectName("Embedded Systems Lab").department("ECE").semester(3).academicYear("2024-25").credits(2).weeklyHours(4).subjectCategory(SubjectCategory.LAB).build());
            subjectMasterRepository.saveAll(subjects);
            System.out.println("--- Subject Master Initialized ---");
        }

        // ─── Faculty Expertise ───────────────────────────────────
        if (facultyExpertiseRepository.count() == 0) {
            // Map subjects by code for easy lookup
            Map<String, SubjectMaster> subjectMap = new HashMap<>();
            subjectMasterRepository.findAll().forEach(s -> subjectMap.put(s.getSubjectCode(), s));

            // CSE faculty
            String csePrefix = "cse_fac";
            assignExpertise(csePrefix + "1@eduflow.com", List.of("DSA","COA"), ExpertiseLevel.PRIMARY, subjectMap);
            assignExpertise(csePrefix + "2@eduflow.com", List.of("DBMS","TOC"), ExpertiseLevel.PRIMARY, subjectMap);
            assignExpertise(csePrefix + "3@eduflow.com", List.of("Java Lab","DSA"), ExpertiseLevel.PRIMARY, subjectMap);
            // Cross-dept: CSE faculty also know OS, DCN (common subjects)
            assignExpertise(csePrefix + "4@eduflow.com", List.of("OS","DCN"), ExpertiseLevel.SECONDARY, subjectMap);

            // IT faculty
            String itPrefix = "it_fac";
            assignExpertise(itPrefix + "1@eduflow.com", List.of("OOPs","WebTech"), ExpertiseLevel.PRIMARY, subjectMap);
            assignExpertise(itPrefix + "2@eduflow.com", List.of("Cloud","Web Lab"), ExpertiseLevel.PRIMARY, subjectMap);
            assignExpertise(itPrefix + "3@eduflow.com", List.of("Cloud","OOPs"), ExpertiseLevel.SECONDARY, subjectMap);

            // ECE faculty
            String ecePrefix = "ece_fac";
            assignExpertise(ecePrefix + "1@eduflow.com", List.of("EDC","DSP"), ExpertiseLevel.PRIMARY, subjectMap);
            assignExpertise(ecePrefix + "2@eduflow.com", List.of("VLSI","Embedded Lab"), ExpertiseLevel.PRIMARY, subjectMap);
            assignExpertise(ecePrefix + "3@eduflow.com", List.of("DSP","VLSI"), ExpertiseLevel.SECONDARY, subjectMap);

            System.out.println("--- Faculty Expertise Initialized ---");
        }

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

        // ─── Only Master Data Seeded (User activity like Attendance/Interviews/Coding removed for realism) ───
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
        // Cascade delete M.Tech CSE students & faculties to prevent referential integrity errors
        List<User> allUsers = userRepository.findAll();
        for (User u : allUsers) {
            boolean isMtechCse = u.getDepartment() != null && (
                "M.Tech CSE".equalsIgnoreCase(u.getDepartment().trim()) ||
                "MTech CSE".equalsIgnoreCase(u.getDepartment().trim())
            );

            if (isMtechCse) {
                if (u.getRole() == Role.FACULTY) {
                    facultyExpertiseRepository.deleteByFacultyId(u.getId());
                    facultyAvailabilityRepository.deleteAll(facultyAvailabilityRepository.findByFacultyId(u.getId()));

                    List<TimetableEntry> entries = timetableEntryRepository.findByFacultyId(u.getId());
                    for (TimetableEntry entry : entries) {
                        entry.setFaculty(null);
                        timetableEntryRepository.save(entry);
                    }

                    List<AttendanceSession> sessions = attendanceSessionRepository.findByFacultyId(u.getId());
                    for (AttendanceSession s : sessions) {
                        attendanceRepository.deleteAll(attendanceRepository.findBySessionId(s.getId()));
                        attendanceSessionRepository.delete(s);
                    }

                    List<LeaveRequest> reviews = leaveRequestRepository.findAll().stream()
                        .filter(lr -> u.getId().equals(lr.getFacultyApproverId()))
                        .toList();
                    for (LeaveRequest lr : reviews) {
                        lr.setFacultyApproverId(null);
                        leaveRequestRepository.save(lr);
                    }

                    notificationRepository.deleteAll(notificationRepository.findByUserOrderByTimestampDesc(u));
                    userRepository.delete(u);
                }
            }
        }

        // Create the 4 subjects for M.Tech CSE: AGAI, SE, DTF, DCN
        List<SubjectMaster> oldSubjects = subjectMasterRepository.findByDepartmentIgnoreCase("M.Tech CSE");
        oldSubjects.addAll(subjectMasterRepository.findByDepartmentIgnoreCase("MTech CSE"));
        for (SubjectMaster sub : oldSubjects) {
            facultyExpertiseRepository.deleteBySubjectId(sub.getId());
            subjectMasterRepository.delete(sub);
        }

        // Use helper to ensure subjects are not duplicated on repeated runs
        SubjectMaster subAgai = getOrCreateSubject("AGAI", "Agentic AI", "M.Tech CSE");
        SubjectMaster subSe   = getOrCreateSubject("SE",   "Software Engineering", "M.Tech CSE");
        SubjectMaster subDtf  = getOrCreateSubject("DTF",  "Design Thinking Fundamentals", "M.Tech CSE");
        SubjectMaster subDcn  = getOrCreateSubject("DCN",  "Data Communication Networks", "M.Tech CSE");

        // Create the 4 faculties
        String standardPassword = passwordEncoder.encode("123456");

        // 1. Mrs. Divya
        User divya = userRepository.save(User.builder()
                .name("Mrs. Divya").email("divya@skcet.ac.in")
                .password(standardPassword).role(Role.FACULTY).department("M.Tech CSE")
                .classAdvisor(false).build());
        facultyExpertiseRepository.save(FacultyExpertise.builder()
                .faculty(divya).subject(subAgai).expertiseLevel(ExpertiseLevel.PRIMARY).build());

        // 2. Mr. Vimit Varghesse (Class Advisor)
        User vimit = userRepository.save(User.builder()
                .name("Mr. Vimit Varghesse").email("vimit@skcet.ac.in")
                .password(standardPassword).role(Role.FACULTY).department("M.Tech CSE")
                .classAdvisor(true).build());
        facultyExpertiseRepository.save(FacultyExpertise.builder()
                .faculty(vimit).subject(subSe).expertiseLevel(ExpertiseLevel.PRIMARY).build());

        // 3. Mr. Sreeraj
        User sreeraj = userRepository.save(User.builder()
                .name("Mr. Sreeraj").email("sreeraj@skcet.ac.in")
                .password(standardPassword).role(Role.FACULTY).department("M.Tech CSE")
                .classAdvisor(false).build());
        facultyExpertiseRepository.save(FacultyExpertise.builder()
                .faculty(sreeraj).subject(subDtf).expertiseLevel(ExpertiseLevel.PRIMARY).build());

        // 4. Mr. Pradeep
        User pradeep = userRepository.save(User.builder()
                .name("Mr. Pradeep").email("pradeep@skcet.ac.in")
                .password(standardPassword).role(Role.FACULTY).department("M.Tech CSE")
                .classAdvisor(false).build());
        facultyExpertiseRepository.save(FacultyExpertise.builder()
                .faculty(pradeep).subject(subDcn).expertiseLevel(ExpertiseLevel.PRIMARY).build());

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
                    student.setSemester(8);
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
                            .semester(8)
                            .year("4")
                            .dateOfBirth(dob)
                            .gender(gender)
                            .address(address)
                            .active(true)
                            .build();
                }

                userRepository.save(student);

                final User finalStudent = student;
                StudentProfile profile = studentProfileRepository.findByUserId(student.getId())
                        .orElseGet(() -> StudentProfile.builder().user(finalStudent).build());

                Map<String, Object> parent = (Map<String, Object>) data.get("parent_contact");
                if (parent != null) {
                    profile.setFatherName((String) parent.get("father_name"));
                    profile.setFatherPhone((String) parent.get("father_phone"));
                    profile.setMotherName((String) parent.get("mother_name"));
                    profile.setMotherPhone((String) parent.get("mother_phone"));
                    profile.setGuardianEmail((String) parent.get("guardian_email"));
                }
                studentProfileRepository.save(profile);
            }
            System.out.println("--- Imported " + studentList.size() + " real M.Tech CSE students ---");
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
                    .semester(8)
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

        // Generate active timetable for M.Tech CSE ONLY if no active version with entries exists
        // (Skip re-seeding if admin has already configured a timetable)
        List<TimetableVersion> existingVersions = timetableVersionRepository.findByDepartmentIgnoreCase("M.Tech CSE");
        existingVersions.addAll(timetableVersionRepository.findByDepartmentIgnoreCase("MTech CSE"));
        boolean hasActiveVersionWithEntries = existingVersions.stream().anyMatch(v ->
            v.isActive() && !timetableEntryRepository.findByVersionId(v.getId()).isEmpty()
        );

        if (hasActiveVersionWithEntries) {
            System.out.println("--- Active M.Tech CSE timetable already exists, skipping re-seed. ---");
            // Re-assign faculty to existing timetable entries (faculty objects were just re-created above)
            Map<String, User> subjectFacultyMap = Map.of(
                "AGAI", divya, "SE", vimit, "DTF", sreeraj, "DCN", pradeep
            );
            existingVersions.stream().filter(TimetableVersion::isActive).findFirst().ifPresent(activeVer -> {
                List<TimetableEntry> entries = timetableEntryRepository.findByVersionId(activeVer.getId());
                for (TimetableEntry entry : entries) {
                    if (entry.getSubject() != null && subjectFacultyMap.containsKey(entry.getSubject())) {
                        entry.setFaculty(subjectFacultyMap.get(entry.getSubject()));
                        timetableEntryRepository.save(entry);
                    }
                }
                System.out.println("--- Re-assigned faculty to " + entries.size() + " existing timetable entries. ---");
            });
        } else {
            // Clear any stale empty versions
            for (TimetableVersion v : existingVersions) {
                timetableEntryRepository.deleteByVersionId(v.getId());
                timetableVersionRepository.delete(v);
            }

            TimetableVersion activeVersion = timetableVersionRepository.save(TimetableVersion.builder()
                    .department("M.Tech CSE").semester(8).academicYear("2024-25")
                    .versionName("Semester 8 Timetable").active(true).build());

            String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"};
            String[] subjects = {"AGAI", "SE", "DTF", "DCN"};
            Map<String, User> subjectFaculties = Map.of(
                "AGAI", divya,
                "SE", vimit,
                "DTF", sreeraj,
                "DCN", pradeep
            );

            Random random = new Random(42);
            for (String day : days) {
                for (int p = 1; p <= 6; p++) {
                    if (p == 6) {
                        timetableEntryRepository.save(TimetableEntry.builder()
                                .department("M.Tech CSE")
                                .dayOfWeek(day).period(p).subject("FREE_ACTIVITY")
                                .activityName("Coding Practice")
                                .faculty(null).version(activeVersion)
                                .semester(8).academicYear("2024-25")
                                .build());
                    } else {
                        String sub = subjects[random.nextInt(subjects.length)];
                        User faculty = subjectFaculties.get(sub);
                        timetableEntryRepository.save(TimetableEntry.builder()
                                .department("M.Tech CSE")
                                .dayOfWeek(day).period(p).subject(sub)
                                .faculty(faculty).version(activeVersion)
                                .semester(8).academicYear("2024-25")
                                .build());
                    }
                }
            }
            System.out.println("--- M.Tech CSE default timetable seeded. ---");
        } // end timetable guard




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
