package com.eduflow.controller;

import com.eduflow.dto.*;
import com.eduflow.entity.User;
import com.eduflow.repository.UserRepository;
import com.eduflow.service.ClassroomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classrooms")
@CrossOrigin(origins = "*")
public class ClassroomController {

    @Autowired
    private ClassroomService classroomService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new RuntimeException("Unauthenticated request");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found: " + userDetails.getUsername()));
    }

    // ─── PHASE 1: CLASSROOM FOUNDATION ─────────────────────────────────────────

    @GetMapping("/my-classrooms")
    public ResponseEntity<List<CourseClassroomResponse>> getMyClassrooms(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = getCurrentUser(userDetails);
            List<CourseClassroomResponse> classrooms = classroomService.getUserClassrooms(user);
            return ResponseEntity.ok(classrooms);
        } catch (Exception e) {
            System.err.println("[ClassroomController] Error in getMyClassrooms: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseClassroomResponse> getClassroomById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        CourseClassroomResponse classroom = classroomService.getClassroomById(id);
        return ResponseEntity.ok(classroom);
    }

    @PostMapping("/sync")
    public ResponseEntity<String> syncClassrooms() {
        try {
            classroomService.autoSyncClassroomsFromERP();
            return ResponseEntity.ok("Classrooms synchronized from ERP successfully");
        } catch (Exception e) {
            System.err.println("[ClassroomController] Error in syncClassrooms: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok("Sync completed with warnings: " + e.getMessage());
        }
    }

    // ─── PHASE 2: STREAM & ANNOUNCEMENTS ─────────────────────────────────────

    @GetMapping("/{id}/announcements")
    public ResponseEntity<List<AnnouncementResponse>> getClassroomAnnouncements(
            @PathVariable Long id) {
        List<AnnouncementResponse> announcements = classroomService.getClassroomAnnouncements(id);
        return ResponseEntity.ok(announcements);
    }

    @PostMapping("/{id}/announcements")
    public ResponseEntity<AnnouncementResponse> createAnnouncement(
            @PathVariable Long id,
            @RequestBody AnnouncementRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        AnnouncementResponse response = classroomService.createAnnouncement(id, request, user);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/announcements/{announcementId}")
    public ResponseEntity<AnnouncementResponse> updateAnnouncement(
            @PathVariable Long announcementId,
            @RequestBody AnnouncementRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        AnnouncementResponse response = classroomService.updateAnnouncement(announcementId, request, user);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/announcements/{announcementId}")
    public ResponseEntity<Void> deleteAnnouncement(
            @PathVariable Long announcementId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        classroomService.deleteAnnouncement(announcementId, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/announcements/{announcementId}/pin")
    public ResponseEntity<AnnouncementResponse> togglePinAnnouncement(
            @PathVariable Long announcementId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        AnnouncementResponse response = classroomService.togglePinAnnouncement(announcementId, user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/announcements/{announcementId}/comments")
    public ResponseEntity<AnnouncementCommentResponse> addCommentToAnnouncement(
            @PathVariable Long announcementId,
            @RequestBody AnnouncementCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        AnnouncementCommentResponse response = classroomService.addCommentToAnnouncement(announcementId, request, user);
        return ResponseEntity.ok(response);
    }

    // ─── PHASE 3.1: CLASSWORK MATERIALS MODULE ───────────────────────────────

    @GetMapping("/{id}/materials")
    public ResponseEntity<List<MaterialResponse>> getClassroomMaterials(
            @PathVariable Long id) {
        List<MaterialResponse> materials = classroomService.getClassroomMaterials(id);
        return ResponseEntity.ok(materials);
    }

    @PostMapping("/{id}/materials")
    public ResponseEntity<MaterialResponse> createMaterial(
            @PathVariable Long id,
            @RequestBody MaterialRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        MaterialResponse response = classroomService.createMaterial(id, request, user);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/materials/{materialId}")
    public ResponseEntity<Void> deleteMaterial(
            @PathVariable Long materialId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        classroomService.deleteMaterial(materialId, user);
        return ResponseEntity.noContent().build();
    }

    // ─── PHASE 3.2: ASSIGNMENT MODULE ────────────────────────────────────────

    @GetMapping("/{id}/assignments")
    public ResponseEntity<List<AssignmentResponse>> getClassroomAssignments(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        List<AssignmentResponse> list = classroomService.getClassroomAssignments(id, user);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/assignments")
    public ResponseEntity<AssignmentResponse> createAssignment(
            @PathVariable Long id,
            @RequestBody AssignmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        AssignmentResponse response = classroomService.createAssignment(id, request, user);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/assignments/{id}")
    public ResponseEntity<AssignmentResponse> updateAssignment(
            @PathVariable Long id,
            @RequestBody AssignmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        AssignmentResponse response = classroomService.updateAssignment(id, request, user);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/assignments/{id}")
    public ResponseEntity<Void> deleteAssignment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        classroomService.deleteAssignment(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/assignments/{id}/submissions")
    public ResponseEntity<List<SubmissionResponse>> getAssignmentSubmissions(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        List<SubmissionResponse> submissions = classroomService.getAssignmentSubmissions(id, user);
        return ResponseEntity.ok(submissions);
    }

    @PostMapping("/assignments/{id}/submit")
    public ResponseEntity<SubmissionResponse> submitAssignment(
            @PathVariable Long id,
            @RequestBody SubmissionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        SubmissionResponse response = classroomService.submitAssignment(id, request, user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<SubmissionResponse> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestBody GradeSubmissionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        SubmissionResponse response = classroomService.gradeSubmission(submissionId, request, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-submissions")
    public ResponseEntity<List<SubmissionResponse>> getMySubmissions(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        List<SubmissionResponse> list = classroomService.getMySubmissions(user);
        return ResponseEntity.ok(list);
    }

    // ─── PHASE 3.3: ASSESSMENT MODULE ───────────────────────────────────────

    @GetMapping("/{id}/assessments")
    public ResponseEntity<List<AssessmentResponse>> getClassroomAssessments(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        List<AssessmentResponse> list = classroomService.getClassroomAssessments(id, user);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/assessments")
    public ResponseEntity<AssessmentResponse> createAssessment(
            @PathVariable Long id,
            @RequestBody AssessmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        AssessmentResponse response = classroomService.createAssessment(id, request, user);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/assessments/{id}")
    public ResponseEntity<Void> deleteAssessment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        classroomService.deleteAssessment(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/assessments/{id}/start")
    public ResponseEntity<AssessmentAttemptResponse> startAssessmentAttempt(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        AssessmentAttemptResponse response = classroomService.startAssessmentAttempt(id, user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/assessments/attempts/{attemptId}/submit")
    public ResponseEntity<AssessmentAttemptResponse> submitAssessmentAttempt(
            @PathVariable Long attemptId,
            @RequestBody AssessmentAttemptRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        AssessmentAttemptResponse response = classroomService.submitAssessmentAttempt(attemptId, request, user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/assessments/attempts/{attemptId}/grade")
    public ResponseEntity<AssessmentAttemptResponse> gradeAssessmentAttempt(
            @PathVariable Long attemptId,
            @RequestParam Double score,
            @RequestParam(required = false) String feedback,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        AssessmentAttemptResponse response = classroomService.gradeAssessmentAttempt(attemptId, score, feedback, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/assessments/{id}/attempts")
    public ResponseEntity<List<AssessmentAttemptResponse>> getAssessmentAttempts(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        List<AssessmentAttemptResponse> list = classroomService.getAssessmentAttempts(id, user);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/assessments/{id}/allow-retake")
    public ResponseEntity<Void> allowStudentRetake(
            @PathVariable Long id,
            @RequestParam Long studentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        classroomService.allowStudentRetake(id, studentId, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/ai-preview-questions")
    public ResponseEntity<List<AssessmentQuestionDTO>> previewAIQuestions(
            @PathVariable Long id,
            @RequestBody AIAssessmentGenRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        List<AssessmentQuestionDTO> response = classroomService.previewAIQuestions(id, request, user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/ai-generate-assessment")
    public ResponseEntity<AssessmentResponse> generateAIAssessment(
            @PathVariable Long id,
            @RequestBody AIAssessmentGenRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        AssessmentResponse response = classroomService.generateAIAssessment(id, request, user);
        return ResponseEntity.ok(response);
    }

    // ─── PHASE 3.4: LECTURE HISTORY MODULE ───────────────────────────────────

    @GetMapping("/{id}/lectures")
    public ResponseEntity<List<LectureResponse>> getLectureTimeline(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        List<LectureResponse> list = classroomService.getLectureTimeline(id, user);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/lectures/{id}")
    public ResponseEntity<LectureResponse> getLectureDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        LectureResponse response = classroomService.getLectureDetails(id, user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/lectures")
    public ResponseEntity<LectureResponse> createLectureHistory(
            @PathVariable Long id,
            @RequestBody LectureRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        LectureResponse response = classroomService.createLectureHistory(id, request, user);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/lectures/{id}")
    public ResponseEntity<LectureResponse> updateLectureTopic(
            @PathVariable Long id,
            @RequestBody LectureRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        LectureResponse response = classroomService.updateLectureTopic(id, request, user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/lectures/{id}/materials")
    public ResponseEntity<LectureResponse> attachMaterialToLecture(
            @PathVariable Long id,
            @RequestParam Long materialId) {
        LectureResponse response = classroomService.attachMaterialToLecture(id, materialId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/lectures/{id}/assignments")
    public ResponseEntity<LectureResponse> attachAssignmentToLecture(
            @PathVariable Long id,
            @RequestParam Long assignmentId) {
        LectureResponse response = classroomService.attachAssignmentToLecture(id, assignmentId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/lectures/{id}/assessments")
    public ResponseEntity<LectureResponse> attachAssessmentToLecture(
            @PathVariable Long id,
            @RequestParam Long assessmentId) {
        LectureResponse response = classroomService.attachAssessmentToLecture(id, assessmentId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/lectures/{id}/coding")
    public ResponseEntity<LectureResponse> attachCodingChallengeToLecture(
            @PathVariable Long id,
            @RequestParam Long codingId) {
        LectureResponse response = classroomService.attachCodingChallengeToLecture(id, codingId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/lectures/{id}/ai-summary")
    public ResponseEntity<LectureResponse> generateAILectureSummary(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        LectureResponse response = classroomService.generateAILectureSummary(id, user);
        return ResponseEntity.ok(response);
    }
}
