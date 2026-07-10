package com.eduflow.service.impl;

import com.eduflow.dto.CodingProgressDto;
import com.eduflow.entity.CodingProgress;
import com.eduflow.entity.User;
import com.eduflow.repository.CodingProgressRepository;
import com.eduflow.repository.UserRepository;
import com.eduflow.service.CodingProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CodingProgressServiceImpl implements CodingProgressService {

    private final CodingProgressRepository codingProgressRepository;
    private final UserRepository userRepository;

    @Override
    public CodingProgressDto getMyProgress(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        CodingProgress progress = codingProgressRepository.findByStudent(user).orElse(null);
        if (progress == null) {
            return CodingProgressDto.builder()
                    .easySolved(0).mediumSolved(0).hardSolved(0).totalSolved(0)
                    .totalAttempted(0).bestScore(0).averageScore(0.0).successRate(0.0)
                    .currentStreak(0).longestStreak(0)
                    .build();
        }
        return mapToDto(progress);
    }

    @Override
    public CodingProgressDto updateProgress(String userEmail, CodingProgressDto dto) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        CodingProgress progress = codingProgressRepository.findByStudent(user).orElse(
                CodingProgress.builder().student(user).build()
        );
        progress.setEasySolved(dto.getEasySolved());
        progress.setMediumSolved(dto.getMediumSolved());
        progress.setHardSolved(dto.getHardSolved());
        progress.setTotalSolved(dto.getTotalSolved());
        progress.setTotalAttempted(dto.getTotalAttempted());
        progress.setBestScore(dto.getBestScore());
        progress.setAverageScore(dto.getAverageScore());
        progress.setSuccessRate(dto.getSuccessRate());
        progress.setCurrentStreak(dto.getCurrentStreak());
        progress.setLongestStreak(dto.getLongestStreak());
        progress.setLastUpdated(LocalDateTime.now());
        
        CodingProgress saved = codingProgressRepository.save(progress);
        return mapToDto(saved);
    }

    private CodingProgressDto mapToDto(CodingProgress progress) {
        return CodingProgressDto.builder()
                .easySolved(progress.getEasySolved())
                .mediumSolved(progress.getMediumSolved())
                .hardSolved(progress.getHardSolved())
                .totalSolved(progress.getTotalSolved())
                .totalAttempted(progress.getTotalAttempted())
                .bestScore(progress.getBestScore())
                .averageScore(progress.getAverageScore())
                .successRate(progress.getSuccessRate())
                .currentStreak(progress.getCurrentStreak())
                .longestStreak(progress.getLongestStreak())
                .lastUpdated(progress.getLastUpdated())
                .build();
    }
}
