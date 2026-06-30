package com.eduflow.service;

import com.eduflow.dto.CodingProgressDto;

public interface CodingProgressService {
    CodingProgressDto getMyProgress(String userEmail);
    CodingProgressDto updateProgress(String userEmail, CodingProgressDto dto);
}
