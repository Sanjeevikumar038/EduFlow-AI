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
                .lastUpdated(progress.getLastUpdated())
                .build();
    }
}
