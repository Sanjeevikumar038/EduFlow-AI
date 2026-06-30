package com.eduflow.service;

import com.eduflow.dto.ResumeResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ResumeService {
    ResumeResponse uploadResume(String userEmail, MultipartFile file);
    List<ResumeResponse> getMyResumes(String userEmail);
    void deleteResume(Long id, String userEmail);
    byte[] downloadResume(Long id, String userEmail);
    
    com.eduflow.dto.JobDescriptionDto addJobDescription(com.eduflow.dto.JobDescriptionDto jobDto);
    java.util.List<com.eduflow.dto.JobDescriptionDto> getAllJobs();
    com.eduflow.dto.JobMatchResponse matchWithJobDescription(String userEmail, Long jobId);
}
