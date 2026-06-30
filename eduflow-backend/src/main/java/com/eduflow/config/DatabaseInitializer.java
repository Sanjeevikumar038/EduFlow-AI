package com.eduflow.config;

import com.eduflow.entity.*;
import com.eduflow.repository.*;
import com.eduflow.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

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

    @Override
    public void run(String... args) throws Exception {

        // ─── Admin ───────────────────────────────────────────────
        if (userRepository.findByEmail("admin").isEmpty()) {
            userRepository.save(User.builder()
                    .name("System Administrator").email("admin")
                    .password(passwordEncoder.encode("admin@123"))
                    .role(Role.ADMIN).build());
            System.out.println("--- Admin Initialized: admin / admin@123 ---");
        }

        // ─── Faculty & Students ──────────────────────────────────
        String[] depts = {"M.Tech CSE", "CSE", "IT", "ECE"};
        String standardPassword = passwordEncoder.encode("123456");

        String[][] facultyNames = {
            {"Dr. Prakash Raj", "Dr. Karthik Keyan", "Dr. Priya Dharshini", "Dr. Anand Kumar", "Dr. Shalini Sen"},
            {"Dr. Suresh Babu", "Dr. Meenakshi S", "Dr. Rajesh K", "Dr. Divya N", "Dr. Hariharan P"},
            {"Dr. Venkatesh R", "Dr. Lakshmi Priya", "Dr. Saravanan M", "Dr. Kavitha B", "Dr. Dinesh Kumar"},
            {"Dr. Ravichandran S", "Dr. Anuradha K", "Dr. Murugan T", "Dr. Gayathri R", "Dr. Senthil Kumar"}
        };

        String[][] studentNames = {
            {"Haresh Kumar", "Ajay Dev", "Sanju Viswanath", "Rahul Sharma", "Karthik Raja"},
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
            // M.Tech CSE - Semester 1, AY 2024-25
            subjects.add(SubjectMaster.builder().subjectCode("OS").subjectName("Operating Systems").department("M.Tech CSE").semester(1).academicYear("2024-25").credits(4).weeklyHours(4).subjectCategory(SubjectCategory.THEORY).build());
            subjects.add(SubjectMaster.builder().subjectCode("DCN").subjectName("Data Communication Networks").department("M.Tech CSE").semester(1).academicYear("2024-25").credits(4).weeklyHours(4).subjectCategory(SubjectCategory.THEORY).build());
            subjects.add(SubjectMaster.builder().subjectCode("PCD").subjectName("Parallel and Cloud Computing").department("M.Tech CSE").semester(1).academicYear("2024-25").credits(3).weeklyHours(3).subjectCategory(SubjectCategory.THEORY).build());
            subjects.add(SubjectMaster.builder().subjectCode("AIES").subjectName("AI Expert Systems").department("M.Tech CSE").semester(1).academicYear("2024-25").credits(3).weeklyHours(3).subjectCategory(SubjectCategory.THEORY).build());
            subjects.add(SubjectMaster.builder().subjectCode("AGAI").subjectName("Agentic AI").department("M.Tech CSE").semester(1).academicYear("2024-25").credits(3).weeklyHours(3).subjectCategory(SubjectCategory.ELECTIVE).build());
            subjects.add(SubjectMaster.builder().subjectCode("SE").subjectName("Software Engineering").department("M.Tech CSE").semester(1).academicYear("2024-25").credits(3).weeklyHours(3).subjectCategory(SubjectCategory.THEORY).build());
            subjects.add(SubjectMaster.builder().subjectCode("CC LAB").subjectName("Cloud Computing Lab").department("M.Tech CSE").semester(1).academicYear("2024-25").credits(2).weeklyHours(4).subjectCategory(SubjectCategory.LAB).build());
            subjects.add(SubjectMaster.builder().subjectCode("AI LAB").subjectName("AI Lab").department("M.Tech CSE").semester(1).academicYear("2024-25").credits(2).weeklyHours(4).subjectCategory(SubjectCategory.LAB).build());
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

            // M.Tech CSE faculty expertise
            String mtechPrefix = "mtechcse_fac";
            assignExpertise(mtechPrefix + "1@eduflow.com", List.of("OS","DCN","SE"), ExpertiseLevel.PRIMARY, subjectMap);
            assignExpertise(mtechPrefix + "2@eduflow.com", List.of("AIES","AGAI","AI LAB"), ExpertiseLevel.PRIMARY, subjectMap);
            assignExpertise(mtechPrefix + "3@eduflow.com", List.of("DBMS","PCD","CC LAB"), ExpertiseLevel.PRIMARY, subjectMap);
            assignExpertise(mtechPrefix + "4@eduflow.com", List.of("OS","SE"), ExpertiseLevel.SECONDARY, subjectMap);
            assignExpertise(mtechPrefix + "5@eduflow.com", List.of("DCN","PCD"), ExpertiseLevel.SECONDARY, subjectMap);

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
            TimetableVersion v1 = timetableVersionRepository.save(TimetableVersion.builder().department("M.Tech CSE").semester(1).academicYear(ay).versionName("Odd Semester 2024").active(true).build());
            TimetableVersion v2 = timetableVersionRepository.save(TimetableVersion.builder().department("CSE").semester(3).academicYear(ay).versionName("Odd Semester 2024").active(true).build());
            TimetableVersion v3 = timetableVersionRepository.save(TimetableVersion.builder().department("IT").semester(3).academicYear(ay).versionName("Odd Semester 2024").active(true).build());
            TimetableVersion v4 = timetableVersionRepository.save(TimetableVersion.builder().department("ECE").semester(3).academicYear(ay).versionName("Odd Semester 2024").active(true).build());

            String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"};
            Random random = new Random(42); // deterministic seed

            seedTimetable(v1, days, new String[]{"OS","DCN","PCD","AIES","AGAI","SE","CC LAB","AI LAB"}, random);
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
