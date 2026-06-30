package com.eduflow.controller;

import com.eduflow.dto.CodingProgressDto;
import com.eduflow.service.CodingProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coding")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CodingProgressController {

    private final CodingProgressService codingProgressService;

    @GetMapping("/my")
    public ResponseEntity<CodingProgressDto> getMyProgress(Authentication authentication) {
        return ResponseEntity.ok(codingProgressService.getMyProgress(authentication.getName()));
    }

    @PostMapping("/update")
    public ResponseEntity<CodingProgressDto> updateProgress(Authentication authentication, @RequestBody CodingProgressDto dto) {
        return ResponseEntity.ok(codingProgressService.updateProgress(authentication.getName(), dto));
    }
}
