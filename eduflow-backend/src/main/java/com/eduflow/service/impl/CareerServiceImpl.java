package com.eduflow.service.impl;

import com.eduflow.dto.CareerReadinessResponse;
import com.eduflow.entity.*;
import com.eduflow.repository.*;
import com.eduflow.service.CareerService;
import com.eduflow.service.GroqService;
import com.eduflow.entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CareerServiceImpl implements CareerService {

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final ResumeRepository resumeRepository;
    private final CodingProgressRepository codingProgressRepository;
    private final InterviewAttemptRepository interviewAttemptRepository;
    private final CareerHistoryRepository careerHistoryRepository;
    private final GroqService groqService;

    @Override
    public CareerReadinessResponse getMyCareerReadiness(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int attendanceScore = calculateAttendanceScore(user);
        int resumeScore = calculateResumeScore(user);
        int codingScore = calculateCodingScore(user);
        
        List<InterviewAttempt> attempts = interviewAttemptRepository.findByStudentOrderByStartedAtDesc(user);
        int interviewScore = calculateInterviewScore(attempts);

        int overallScore = attendanceScore + resumeScore + codingScore + interviewScore;
        
        String status = "Needs Improvement";
        if (overallScore >= 85) status = "Excellent";
        else if (overallScore >= 70) status = "Good";
        else if (overallScore >= 50) status = "Average";

        // Check if we need to update CareerHistory
        List<CareerHistory> history = careerHistoryRepository.findByStudentOrderByCareerScoreDateAsc(user);
        if (history.isEmpty() || !history.get(history.size() - 1).getCareerScore().equals(overallScore)) {
            careerHistoryRepository.save(CareerHistory.builder()
                    .student(user)
                    .careerScore(overallScore)
                    .careerScoreDate(java.time.LocalDateTime.now())
                    .build());
        }

        List<String> recommendations = generateRecommendations(attendanceScore, resumeScore, codingScore, interviewScore);
        
        // Calculate new metrics
        int lastInterviewScore = 0;
        int bestInterviewScore = 0;
        int interviewStreak = 0;
        String strongestDomain = "N/A";
        
        if (!attempts.isEmpty()) {
            lastInterviewScore = attempts.get(0).getOverallScore() != null ? attempts.get(0).getOverallScore() : 0;
            bestInterviewScore = attempts.stream().mapToInt(a -> a.getOverallScore() != null ? a.getOverallScore() : 0).max().orElse(0);
            
            for (InterviewAttempt attempt : attempts) {
                if (attempt.getOverallScore() != null && attempt.getOverallScore() >= 70) {
                    interviewStreak++;
                } else {
                    break;
                }
            }
            
            Map<String, List<InterviewAttempt>> byDomain = attempts.stream().collect(Collectors.groupingBy(a -> a.getDomain().getName()));
            double bestAvg = -1;
            for (Map.Entry<String, List<InterviewAttempt>> entry : byDomain.entrySet()) {
                double avg = entry.getValue().stream().mapToInt(a -> a.getOverallScore() != null ? a.getOverallScore() : 0).average().orElse(0);
                if (avg > bestAvg) {
                    bestAvg = avg;
                    strongestDomain = entry.getKey();
                }
            }
        }
        int totalMockSessions = attempts.size();
        
        int totalCodingSolved = codingProgressRepository.findByStudent(user)
                .map(com.eduflow.entity.CodingProgress::getTotalSolved)
                .orElse(0);

        return CareerReadinessResponse.builder()
                .attendanceScore(attendanceScore)
                .resumeScore(resumeScore)
                .codingScore(codingScore)
                .interviewScore(interviewScore)
                .overallCareerScore(overallScore)
                .status(status)
                .recommendations(recommendations)
                .lastInterviewScore(lastInterviewScore)
                .bestInterviewScore(bestInterviewScore)
                .interviewStreak(interviewStreak)
                .strongestDomain(strongestDomain)
                .totalMockSessions(totalMockSessions)
                .totalCodingSolved(totalCodingSolved)
                .build();
    }

    public Map<String, Object> getCareerRecommendations(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));
        int att = calculateAttendanceScore(user);
        int res = calculateResumeScore(user);
        int cod = calculateCodingScore(user);
        int intv = calculateInterviewScore(interviewAttemptRepository.findByStudentOrderByStartedAtDesc(user));

        String prompt = String.format("A student has the following career readiness scores (out of 25 each): Attendance: %d, Resume: %d, Coding: %d, Interview: %d. Provide personalized AI Career Mentor advice.", att, res, cod, intv);
        String systemPrompt = "You are an AI Career Mentor for a college student. You will provide a personalized mentorship plan. Return a JSON object with keys: 'overallRecommendation' (String), 'immediateImprovements' (String array), 'weeklyLearningPlan' (String), 'monthlyGoal' (String), 'placementReadiness' (String percentage or status), 'recommendedTechnologies' (String array), 'confidenceLevel' (String, e.g., 'High', 'Moderate', 'Needs Boost').";
        
        String aiResponse = groqService.generateJsonResponse(systemPrompt, prompt);
        
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(aiResponse, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return Map.of("error", "Failed to parse AI recommendations");
        }
    }

    @Override
    public java.util.List<com.eduflow.dto.CareerHistoryDto> getHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));
        return careerHistoryRepository.findByStudentOrderByCareerScoreDateAsc(user).stream()
                .map(history -> com.eduflow.dto.CareerHistoryDto.builder()
                        .id(history.getId())
                        .careerScore(history.getCareerScore())
                        .careerScoreDate(history.getCareerScoreDate())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getFacultyInsights(String department) {
        List<User> students = userRepository.findByRoleAndDepartment(Role.STUDENT, department);
        
        List<Map<String, Object>> studentData = new ArrayList<>();
        double totalScore = 0;
        
        for (User student : students) {
            int att = calculateAttendanceScore(student);
            int res = calculateResumeScore(student);
            int cod = calculateCodingScore(student);
            int intv = calculateInterviewScore(interviewAttemptRepository.findByStudentOrderByStartedAtDesc(student));
            int overall = att + res + cod + intv;
            totalScore += overall;
            
            Map<String, Object> sMap = new HashMap<>();
            sMap.put("id", student.getId());
            sMap.put("name", student.getName());
            sMap.put("registerNumber", student.getRegisterNumber());
            sMap.put("overallScore", overall);
            sMap.put("attendanceScore", att);
            sMap.put("resumeScore", res);
            sMap.put("codingScore", cod);
            sMap.put("interviewScore", intv);
            studentData.add(sMap);
        }
        
        studentData.sort((a, b) -> Integer.compare((int)b.get("overallScore"), (int)a.get("overallScore")));
        
        Map<String, Object> response = new HashMap<>();
        response.put("averageReadiness", students.isEmpty() ? 0 : totalScore / students.size());
        response.put("topStudents", studentData.stream().limit(5).collect(Collectors.toList()));
        response.put("needsImprovement", studentData.stream().filter(s -> (int)s.get("overallScore") < 70).collect(Collectors.toList()));
        
        return response;
    }

    @Override
    public Map<String, Object> getAdminInsights() {
        List<User> students = userRepository.findByRole(Role.STUDENT);
        
        double totalAtt = 0, totalRes = 0, totalCod = 0, totalIntv = 0;
        Map<String, Double> deptScores = new HashMap<>();
        Map<String, Integer> deptCounts = new HashMap<>();
        
        for (User student : students) {
            int att = calculateAttendanceScore(student);
            int res = calculateResumeScore(student);
            int cod = calculateCodingScore(student);
            int intv = calculateInterviewScore(interviewAttemptRepository.findByStudentOrderByStartedAtDesc(student));
            int overall = att + res + cod + intv;
            
            totalAtt += att; totalRes += res; totalCod += cod; totalIntv += intv;
            
            String dept = student.getDepartment();
            deptScores.put(dept, deptScores.getOrDefault(dept, 0.0) + overall);
            deptCounts.put(dept, deptCounts.getOrDefault(dept, 0) + 1);
        }
        
        List<Map<String, Object>> deptComparison = new ArrayList<>();
        for (String dept : deptScores.keySet()) {
            Map<String, Object> dMap = new HashMap<>();
            dMap.put("department", dept);
            dMap.put("averageScore", deptScores.get(dept) / deptCounts.get(dept));
            deptComparison.add(dMap);
        }
        
        deptComparison.sort((a, b) -> Double.compare((double)b.get("averageScore"), (double)a.get("averageScore")));
        
        int n = students.isEmpty() ? 1 : students.size();
        
        Map<String, Object> response = new HashMap<>();
        response.put("averageCareerScore", (totalAtt + totalRes + totalCod + totalIntv) / n);
        response.put("averageResumeScore", totalRes / n);
        response.put("averageCodingScore", totalCod / n);
        response.put("averageInterviewScore", totalIntv / n);
        response.put("departmentComparison", deptComparison);
        
        return response;
    }

    private int calculateAttendanceScore(User user) {
        List<Attendance> attendances = attendanceRepository.findByStudentId(user.getId());
        if (attendances.isEmpty()) return 0; // If no attendance, we can assume 0 or 25, let's say 0
        
        long presentCount = attendances.stream().filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus())).count();
        double percentage = (double) presentCount / attendances.size() * 100;
        return (int) (percentage * 0.25);
    }

    private int calculateResumeScore(User user) {
        return resumeRepository.findFirstByStudentOrderByUploadedDateDesc(user)
                .map(resume -> (int) (resume.getAtsScore() * 0.25))
                .orElse(0);
    }

    private int calculateCodingScore(User user) {
        return codingProgressRepository.findByStudent(user)
                .map(progress -> {
                    // Assuming 200 total solved is excellent
                    int score = (progress.getTotalSolved() * 100) / 200;
                    if (score > 100) score = 100;
                    return (int) (score * 0.25);
                })
                .orElse(0);
    }

    private int calculateInterviewScore(List<InterviewAttempt> results) {
        if (results.isEmpty()) return 0;
        Integer latestScore = results.get(0).getOverallScore();
        return latestScore != null ? (int) (latestScore * 0.25) : 0;
    }

    private List<String> generateRecommendations(int att, int res, int cod, int intv) {
        List<String> recs = new ArrayList<>();
        if (att < 18) recs.add("Improve attendance (Aim for > 75%)");
        if (res < 15) recs.add("Upload updated resume (ATS score is low)");
        if (cod < 15) recs.add("Solve more coding problems");
        if (intv < 15) recs.add("Practice mock interviews");
        if (recs.isEmpty()) recs.add("Keep up the great work!");
        return recs;
    }
}
