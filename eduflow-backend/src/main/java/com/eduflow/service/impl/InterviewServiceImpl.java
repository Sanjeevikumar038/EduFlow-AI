package com.eduflow.service.impl;

import com.eduflow.dto.*;
import com.eduflow.entity.*;
import com.eduflow.repository.*;
import com.eduflow.service.GroqService;
import com.eduflow.service.InterviewService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.OptionalDouble;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {

    private final InterviewDomainRepository domainRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewAttemptRepository attemptRepository;
    private final InterviewResponseRepository responseRepository;
    private final UserRepository userRepository;
    private final GroqService groqService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public List<InterviewDomainDto> getAllDomains() {
        return domainRepository.findAll().stream()
                .filter(InterviewDomain::getIsActive)
                .map(d -> InterviewDomainDto.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .description(d.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InterviewAttemptDto startAttempt(String userEmail, Long domainId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        InterviewDomain domain = domainRepository.findById(domainId)
                .orElseThrow(() -> new RuntimeException("Domain not found"));

        List<InterviewQuestion> allQuestions = questionRepository.findByDomainAndIsActiveTrue(domain);
        if (allQuestions.size() < 5) {
            throw new RuntimeException("Not enough questions in this domain.");
        }
        
        Collections.shuffle(allQuestions);
        List<InterviewQuestion> selectedQuestions = allQuestions.subList(0, 5);

        InterviewAttempt attempt = InterviewAttempt.builder()
                .student(user)
                .domain(domain)
                .startedAt(LocalDateTime.now())
                .status("IN_PROGRESS")
                .build();
        
        attempt = attemptRepository.save(attempt);

        List<InterviewResponse> responses = new java.util.ArrayList<>();
        for (int i = 0; i < 5; i++) {
            InterviewResponse res = InterviewResponse.builder()
                    .attempt(attempt)
                    .question(selectedQuestions.get(i))
                    .questionNumber(i + 1)
                    .build();
            responses.add(responseRepository.save(res));
        }

        return mapToDto(attempt, responses);
    }

    @Override
    @Transactional
    public InterviewResponseDto submitResponse(String userEmail, Long attemptId, Long questionId, String transcript, int questionNumber) {
        InterviewAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
        if (!attempt.getStudent().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized");
        }

        InterviewQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        InterviewResponse response = responseRepository.findByAttemptOrderByQuestionNumberAsc(attempt).stream()
                .filter(r -> r.getQuestion().getId().equals(questionId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Response record not found"));

        String systemPrompt = "You are an expert AI Technical Interviewer. Evaluate the candidate's answer based on the question. Return ONLY valid JSON with keys: communicationScore (0-100), technicalScore (0-100), confidenceScore (0-100), grammarScore (0-100), fluencyScore (0-100), professionalismScore (0-100), completenessScore (0-100), overallScore (0-100), feedback (string), idealAnswer (string).";
        String prompt = String.format("Question: %s\nCandidate Answer: \"%s\"\nProvide detailed scores, feedback, and what an ideal answer would be.", question.getQuestion(), transcript);
        
        String aiResponse = groqService.generateJsonResponse(systemPrompt, prompt);

        response.setTranscript(transcript);
        
        try {
            JsonNode root = objectMapper.readTree(aiResponse);
            response.setCommunicationScore(root.path("communicationScore").asInt());
            response.setTechnicalScore(root.path("technicalScore").asInt());
            response.setConfidenceScore(root.path("confidenceScore").asInt());
            response.setGrammarScore(root.path("grammarScore").asInt());
            response.setFluencyScore(root.path("fluencyScore").asInt());
            response.setProfessionalismScore(root.path("professionalismScore").asInt());
            response.setCompletenessScore(root.path("completenessScore").asInt());
            response.setOverallScore(root.path("overallScore").asInt());
            response.setFeedback(root.path("feedback").asText());
            response.setIdealAnswer(root.path("idealAnswer").asText());
        } catch (Exception e) {
            response.setOverallScore(0);
            response.setFeedback("Failed to parse AI evaluation.");
        }

        response = responseRepository.save(response);
        return mapToDto(response);
    }

    @Override
    @Transactional
    public InterviewAttemptDto completeAttempt(String userEmail, Long attemptId) {
        InterviewAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
        if (!attempt.getStudent().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized");
        }

        List<InterviewResponse> responses = responseRepository.findByAttemptOrderByQuestionNumberAsc(attempt);
        
        attempt.setCompletedAt(LocalDateTime.now());
        attempt.setStatus("COMPLETED");

        attempt.setCommunicationScore(average(responses.stream().mapToInt(r -> r.getCommunicationScore() != null ? r.getCommunicationScore() : 0).toArray()));
        attempt.setTechnicalScore(average(responses.stream().mapToInt(r -> r.getTechnicalScore() != null ? r.getTechnicalScore() : 0).toArray()));
        attempt.setConfidenceScore(average(responses.stream().mapToInt(r -> r.getConfidenceScore() != null ? r.getConfidenceScore() : 0).toArray()));
        attempt.setGrammarScore(average(responses.stream().mapToInt(r -> r.getGrammarScore() != null ? r.getGrammarScore() : 0).toArray()));
        attempt.setFluencyScore(average(responses.stream().mapToInt(r -> r.getFluencyScore() != null ? r.getFluencyScore() : 0).toArray()));
        attempt.setProfessionalismScore(average(responses.stream().mapToInt(r -> r.getProfessionalismScore() != null ? r.getProfessionalismScore() : 0).toArray()));
        attempt.setCompletenessScore(average(responses.stream().mapToInt(r -> r.getCompletenessScore() != null ? r.getCompletenessScore() : 0).toArray()));
        attempt.setOverallScore(average(responses.stream().mapToInt(r -> r.getOverallScore() != null ? r.getOverallScore() : 0).toArray()));

        // Generate AI Summary Report
        String systemPrompt = "You are an expert AI Career Mentor. The candidate just completed a 5-question mock interview. Generate a final summary report. Return ONLY valid JSON with keys: interviewRating (string, e.g. '★★★★☆'), hiringRecommendation (string), strongestArea (string), weakestArea (string), placementReadiness (string, e.g. '82%'), recommendedLearningPath (string array), estimatedInterviewLevel (string).";
        
        StringBuilder prompt = new StringBuilder("Interview Domain: " + attempt.getDomain().getName() + "\n\n");
        for (InterviewResponse r : responses) {
            prompt.append("Q: ").append(r.getQuestion().getQuestion()).append("\n");
            prompt.append("Score: ").append(r.getOverallScore()).append("\n");
            prompt.append("Feedback: ").append(r.getFeedback()).append("\n\n");
        }
        
        String aiSummaryResponse = groqService.generateJsonResponse(systemPrompt, prompt.toString());
        attempt.setAiSummary(aiSummaryResponse);

        attempt = attemptRepository.save(attempt);
        return mapToDto(attempt, responses);
    }

    @Override
    public List<InterviewAttemptDto> getStudentAttempts(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return attemptRepository.findByStudentOrderByStartedAtDesc(user).stream()
                .map(a -> mapToDto(a, responseRepository.findByAttemptOrderByQuestionNumberAsc(a)))
                .collect(Collectors.toList());
    }

    private int average(int[] scores) {
        OptionalDouble avg = java.util.Arrays.stream(scores).average();
        return avg.isPresent() ? (int) Math.round(avg.getAsDouble()) : 0;
    }

    private InterviewAttemptDto mapToDto(InterviewAttempt attempt, List<InterviewResponse> responses) {
        return InterviewAttemptDto.builder()
                .id(attempt.getId())
                .domainName(attempt.getDomain().getName())
                .startedAt(attempt.getStartedAt())
                .completedAt(attempt.getCompletedAt())
                .status(attempt.getStatus())
                .overallScore(attempt.getOverallScore())
                .communicationScore(attempt.getCommunicationScore())
                .technicalScore(attempt.getTechnicalScore())
                .confidenceScore(attempt.getConfidenceScore())
                .grammarScore(attempt.getGrammarScore())
                .fluencyScore(attempt.getFluencyScore())
                .professionalismScore(attempt.getProfessionalismScore())
                .completenessScore(attempt.getCompletenessScore())
                .aiSummary(attempt.getAiSummary())
                .responses(responses.stream().map(this::mapToDto).collect(Collectors.toList()))
                .build();
    }

    private InterviewResponseDto mapToDto(InterviewResponse res) {
        return InterviewResponseDto.builder()
                .id(res.getId())
                .attemptId(res.getAttempt().getId())
                .questionId(res.getQuestion().getId())
                .questionText(res.getQuestion().getQuestion())
                .questionNumber(res.getQuestionNumber())
                .transcript(res.getTranscript())
                .feedback(res.getFeedback())
                .idealAnswer(res.getIdealAnswer())
                .communicationScore(res.getCommunicationScore())
                .technicalScore(res.getTechnicalScore())
                .confidenceScore(res.getConfidenceScore())
                .grammarScore(res.getGrammarScore())
                .fluencyScore(res.getFluencyScore())
                .professionalismScore(res.getProfessionalismScore())
                .completenessScore(res.getCompletenessScore())
                .overallScore(res.getOverallScore())
                .build();
    }
}
