package com.eduflow.service.impl;

import com.eduflow.dto.ResumeResponse;
import com.eduflow.entity.Resume;
import com.eduflow.entity.User;
import com.eduflow.repository.ResumeRepository;
import com.eduflow.repository.UserRepository;
import com.eduflow.repository.JobDescriptionRepository;
import com.eduflow.service.ResumeService;
import com.eduflow.service.GroqService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final JobDescriptionRepository jobDescriptionRepository;
    private final GroqService groqService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private final String UPLOAD_DIR = "uploads/resumes/";

    @Override
    public ResumeResponse uploadResume(String userEmail, MultipartFile file) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String filePath = UPLOAD_DIR + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path dest = Paths.get(filePath);
            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

            String extractedText = "";
            try (PDDocument document = Loader.loadPDF(dest.toFile())) {
                PDFTextStripper stripper = new PDFTextStripper();
                extractedText = stripper.getText(document);
            } catch (Exception e) {
                // If PDFBox fails to read, we continue with empty text
                extractedText = "Failed to extract text.";
            }

            String prompt = String.format("You are an expert AI ATS parser and Career Mentor.\nAnalyze this resume text:\n\"\"\"\n%s\n\"\"\"\nProvide an extremely detailed JSON analysis. The JSON must have the following keys: 'atsScore' (integer, 0-100), 'atsBreakdown' (JSON object with integer fields: Formatting, Grammar, Projects, Skills, Achievements, Keywords, Overall), 'summary' (string), 'strengths' (string array), 'weaknesses' (string array), 'skillsFound' (string array), 'recommendedSkills' (string array), 'improvementSuggestions' (string array).", extractedText);
            
            String aiResponse = groqService.generateJsonResponse("You are a helpful AI assistant. Return ONLY valid JSON.", prompt);
            
            Resume resume = Resume.builder()
                    .student(user)
                    .fileName(file.getOriginalFilename())
                    .filePath(filePath)
                    .uploadedDate(LocalDateTime.now())
                    .extractedText(extractedText)
                    .aiResponse(aiResponse)
                    .build();

            try {
                JsonNode root = objectMapper.readTree(aiResponse);
                resume.setAtsScore(root.path("atsScore").asInt());
                resume.setAtsBreakdown(root.path("atsBreakdown").toString());
                resume.setSummary(root.path("summary").asText());
                resume.setStrengths(root.path("strengths").toString());
                resume.setWeaknesses(root.path("weaknesses").toString());
                resume.setSkillsFound(root.path("skillsFound").toString());
                resume.setRecommendedSkills(root.path("recommendedSkills").toString());
                resume.setImprovementSuggestions(root.path("improvementSuggestions").toString());
            } catch (Exception e) {
                resume.setAtsScore(50);
                resume.setSummary("Failed to parse AI response.");
            }
                    
            Resume saved = resumeRepository.save(resume);
            return mapToDto(saved);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Override
    public List<ResumeResponse> getMyResumes(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return resumeRepository.findByStudentOrderByUploadedDateDesc(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteResume(Long id, String userEmail) {
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found"));
        if (!resume.getStudent().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized");
        }
        File file = new File(resume.getFilePath());
        if (file.exists()) {
            file.delete();
        }
        resumeRepository.delete(resume);
    }

    @Override
    public byte[] downloadResume(Long id, String userEmail) {
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found"));
        if (!resume.getStudent().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized");
        }
        try {
            return Files.readAllBytes(new File(resume.getFilePath()).toPath());
        } catch (IOException e) {
            throw new RuntimeException("File read error", e);
        }
    }

    private ResumeResponse mapToDto(Resume resume) {
        return ResumeResponse.builder()
                .id(resume.getId())
                .fileName(resume.getFileName())
                .uploadedDate(resume.getUploadedDate())
                .atsScore(resume.getAtsScore())
                .atsBreakdown(resume.getAtsBreakdown())
                .summary(resume.getSummary())
                .strengths(resume.getStrengths())
                .weaknesses(resume.getWeaknesses())
                .skillsFound(resume.getSkillsFound())
                .recommendedSkills(resume.getRecommendedSkills())
                .improvementSuggestions(resume.getImprovementSuggestions())
                .build();
    }

    @Override
    public com.eduflow.dto.JobDescriptionDto addJobDescription(com.eduflow.dto.JobDescriptionDto jobDto) {
        com.eduflow.entity.JobDescription jd = com.eduflow.entity.JobDescription.builder()
            .title(jobDto.getTitle())
            .companyName(jobDto.getCompanyName())
            .descriptionText(jobDto.getDescriptionText())
            .postedDate(LocalDateTime.now())
            .build();
        jd = jobDescriptionRepository.save(jd);
        jobDto.setId(jd.getId());
        jobDto.setPostedDate(jd.getPostedDate());
        return jobDto;
    }

    @Override
    public List<com.eduflow.dto.JobDescriptionDto> getAllJobs() {
        return jobDescriptionRepository.findAll().stream()
            .map(jd -> com.eduflow.dto.JobDescriptionDto.builder()
                .id(jd.getId())
                .title(jd.getTitle())
                .companyName(jd.getCompanyName())
                .descriptionText(jd.getDescriptionText())
                .postedDate(jd.getPostedDate())
                .build())
            .collect(Collectors.toList());
    }

    @Override
    public com.eduflow.dto.JobMatchResponse matchWithJobDescription(String userEmail, Long jobId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Resume> resumes = resumeRepository.findByStudentOrderByUploadedDateDesc(user);
        if(resumes.isEmpty()) {
            throw new RuntimeException("No resumes uploaded yet.");
        }
        Resume latestResume = resumes.get(0);

        com.eduflow.entity.JobDescription jd = jobDescriptionRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        String prompt = String.format("You are an expert ATS and recruiter AI.\n" +
            "Compare the candidate's resume with the job description.\n\n" +
            "Candidate Resume Text:\n\"\"\"\n%s\n\"\"\"\n\n" +
            "Job Description Text:\n\"\"\"\n%s\n\"\"\"\n\n" +
            "Return a JSON object with EXACTLY these keys: 'matchScore' (integer 0-100), 'matchedSkills' (array of strings), 'missingSkills' (array of strings), 'suggestions' (array of strings).", 
            latestResume.getExtractedText(), jd.getDescriptionText());

        String aiResponse = groqService.generateJsonResponse("You are a helpful AI assistant. Return ONLY valid JSON.", prompt);

        com.eduflow.dto.JobMatchResponse matchResponse = new com.eduflow.dto.JobMatchResponse();
        try {
            JsonNode root = objectMapper.readTree(aiResponse);
            matchResponse.setMatchScore(root.path("matchScore").asInt());
            matchResponse.setMatchedSkills(objectMapper.convertValue(root.path("matchedSkills"), List.class));
            matchResponse.setMissingSkills(objectMapper.convertValue(root.path("missingSkills"), List.class));
            matchResponse.setSuggestions(objectMapper.convertValue(root.path("suggestions"), List.class));
        } catch (Exception e) {
            matchResponse.setMatchScore(0);
            matchResponse.setSuggestions(List.of("Failed to parse AI matching response."));
        }
        return matchResponse;
    }
}
