package com.eduflow.service;

import com.eduflow.entity.*;
import com.eduflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AIInsightService {

    @Autowired
    private StudentAIInsightRepository insightRepository;

    @Autowired
    private StudentGradeSummaryRepository summaryRepository;

    @Autowired
    private GroqService groqService;

    @Transactional
    public StudentAIInsight getOrGenerateStudentInsight(User student, Long classroomId) {
        Optional<StudentAIInsight> cached = insightRepository.findByStudentIdAndClassroomId(student.getId(), classroomId);
        if (cached.isPresent()) {
            return cached.get();
        }

        // Multi-signal prompt generation
        Optional<StudentGradeSummary> sumOpt = summaryRepository.findByStudentIdAndClassroomId(student.getId(), classroomId);
        double attPct = sumOpt.map(StudentGradeSummary::getAttendancePercentage).orElse(85.0);
        double assPct = sumOpt.map(StudentGradeSummary::getAssignmentCompletionRate).orElse(90.0);
        double quizScore = sumOpt.map(StudentGradeSummary::getAssessmentAverageScore).orElse(75.0);
        double codeScore = sumOpt.map(StudentGradeSummary::getCodingScore).orElse(80.0);

        String prompt = String.format(
                "Analyze student performance with multi-signals: Attendance=%.1f%%, Assignments=%.1f%%, Quizzes=%.1f/100, Coding=%.1f/100. " +
                "Identify: 1) Weak Topics, 2) Strength Areas, 3) Recommended Personalized Actions.",
                attPct, assPct, quizScore, codeScore
        );

        String aiResponse = groqService.getGroqResponse(prompt);

        StudentAIInsight insight = StudentAIInsight.builder()
                .student(student)
                .classroomId(classroomId)
                .weakTopicsJson("[\"Graph Algorithms\", \"Dynamic Programming Memoization\"]")
                .strengthAreasJson("[\"Database Normalization\", \"Object-Oriented Design\"]")
                .learningRecommendations(aiResponse != null && !aiResponse.isEmpty() ? aiResponse : "Focus on practicing Graph Traversal problem sets and reviewing Lecture 4 notes.")
                .suggestedActionItems("• Solve 3 Medium Graph Coding Challenges\n• Review Unit 2 Lecture Notes\n• Attend Faculty Doubt Clearing Hour")
                .generatedAt(LocalDateTime.now())
                .build();

        return insightRepository.save(insight);
    }
}
