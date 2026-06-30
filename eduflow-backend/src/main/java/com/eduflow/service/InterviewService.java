package com.eduflow.service;

import com.eduflow.dto.*;
import java.util.List;

public interface InterviewService {
    List<InterviewDomainDto> getAllDomains();
    InterviewAttemptDto startAttempt(String userEmail, Long domainId);
    InterviewResponseDto submitResponse(String userEmail, Long attemptId, Long questionId, String transcript, int questionNumber);
    InterviewAttemptDto completeAttempt(String userEmail, Long attemptId);
    List<InterviewAttemptDto> getStudentAttempts(String userEmail);
}
