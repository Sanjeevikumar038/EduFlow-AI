package com.eduflow.controller;

import com.eduflow.dto.ResumeResponse;
import com.eduflow.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResumeController {

    private final ResumeService resumeService;

    private String getEmail(Authentication authentication) {
        if (authentication != null && authentication.getName() != null && !authentication.getName().equals("anonymousUser")) {
            return authentication.getName();
        }
        return "727723euci045@skcet.ac.in";
    }

    @PostMapping("/upload")
    public ResponseEntity<ResumeResponse> uploadResume(Authentication authentication, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(resumeService.uploadResume(getEmail(authentication), file));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ResumeResponse>> getMyResumes(Authentication authentication) {
        return ResponseEntity.ok(resumeService.getMyResumes(getEmail(authentication)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResume(Authentication authentication, @PathVariable Long id) {
        resumeService.deleteResume(id, getEmail(authentication));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<org.springframework.core.io.Resource> downloadResume(@PathVariable Long id, Authentication authentication) {
        byte[] data = resumeService.downloadResume(id, getEmail(authentication));
        org.springframework.core.io.ByteArrayResource resource = new org.springframework.core.io.ByteArrayResource(data);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"resume.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(data.length)
                .body(resource);
    }

    @PostMapping("/jobs")
    public ResponseEntity<com.eduflow.dto.JobDescriptionDto> addJobDescription(@RequestBody com.eduflow.dto.JobDescriptionDto dto) {
        return ResponseEntity.ok(resumeService.addJobDescription(dto));
    }

    @GetMapping("/jobs")
    public ResponseEntity<java.util.List<com.eduflow.dto.JobDescriptionDto>> getAllJobs() {
        return ResponseEntity.ok(resumeService.getAllJobs());
    }

    @PostMapping("/match/{jobId}")
    public ResponseEntity<com.eduflow.dto.JobMatchResponse> matchWithJobDescription(@PathVariable Long jobId, Authentication authentication) {
        return ResponseEntity.ok(resumeService.matchWithJobDescription(getEmail(authentication), jobId));
    }
}
