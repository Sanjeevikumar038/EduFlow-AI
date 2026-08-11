package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_grade_summaries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentGradeSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    private Long classroomId;

    private String subjectName;

    @Builder.Default
    private Double attendancePercentage = 0.0;

    @Builder.Default
    private Double assignmentCompletionRate = 0.0;

    @Builder.Default
    private Double assessmentAverageScore = 0.0;

    @Builder.Default
    private Double codingScore = 0.0;

    @Builder.Default
    private Double overallWeightedGrade = 0.0;

    private String letterGrade; // A+, A, B, C, F

    @Builder.Default
    private boolean atRisk = false;

    private String atRiskReason;

    @Builder.Default
    private LocalDateTime lastCalculatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public Long getClassroomId() { return classroomId; }
    public void setClassroomId(Long classroomId) { this.classroomId = classroomId; }
    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public Double getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(Double attendancePercentage) { this.attendancePercentage = attendancePercentage; }
    public Double getAssignmentCompletionRate() { return assignmentCompletionRate; }
    public void setAssignmentCompletionRate(Double assignmentCompletionRate) { this.assignmentCompletionRate = assignmentCompletionRate; }
    public Double getAssessmentAverageScore() { return assessmentAverageScore; }
    public void setAssessmentAverageScore(Double assessmentAverageScore) { this.assessmentAverageScore = assessmentAverageScore; }
    public Double getCodingScore() { return codingScore; }
    public void setCodingScore(Double codingScore) { this.codingScore = codingScore; }
    public Double getOverallWeightedGrade() { return overallWeightedGrade; }
    public void setOverallWeightedGrade(Double overallWeightedGrade) { this.overallWeightedGrade = overallWeightedGrade; }
    public String getLetterGrade() { return letterGrade; }
    public void setLetterGrade(String letterGrade) { this.letterGrade = letterGrade; }
    public boolean isAtRisk() { return atRisk; }
    public void setAtRisk(boolean atRisk) { this.atRisk = atRisk; }
    public String getAtRiskReason() { return atRiskReason; }
    public void setAtRiskReason(String atRiskReason) { this.atRiskReason = atRiskReason; }
    public LocalDateTime getLastCalculatedAt() { return lastCalculatedAt; }
    public void setLastCalculatedAt(LocalDateTime lastCalculatedAt) { this.lastCalculatedAt = lastCalculatedAt; }

    public static StudentGradeSummaryBuilder builder() { return new StudentGradeSummaryBuilder(); }
    public static class StudentGradeSummaryBuilder {
        private Long id;
        private User student;
        private Long classroomId;
        private String subjectName;
        private Double attendancePercentage = 0.0;
        private Double assignmentCompletionRate = 0.0;
        private Double assessmentAverageScore = 0.0;
        private Double codingScore = 0.0;
        private Double overallWeightedGrade = 0.0;
        private String letterGrade;
        private boolean atRisk = false;
        private String atRiskReason;
        private LocalDateTime lastCalculatedAt = LocalDateTime.now();

        public StudentGradeSummaryBuilder id(Long id) { this.id = id; return this; }
        public StudentGradeSummaryBuilder student(User student) { this.student = student; return this; }
        public StudentGradeSummaryBuilder classroomId(Long classroomId) { this.classroomId = classroomId; return this; }
        public StudentGradeSummaryBuilder subjectName(String subjectName) { this.subjectName = subjectName; return this; }
        public StudentGradeSummaryBuilder attendancePercentage(Double attendancePercentage) { this.attendancePercentage = attendancePercentage; return this; }
        public StudentGradeSummaryBuilder assignmentCompletionRate(Double assignmentCompletionRate) { this.assignmentCompletionRate = assignmentCompletionRate; return this; }
        public StudentGradeSummaryBuilder assessmentAverageScore(Double assessmentAverageScore) { this.assessmentAverageScore = assessmentAverageScore; return this; }
        public StudentGradeSummaryBuilder codingScore(Double codingScore) { this.codingScore = codingScore; return this; }
        public StudentGradeSummaryBuilder overallWeightedGrade(Double overallWeightedGrade) { this.overallWeightedGrade = overallWeightedGrade; return this; }
        public StudentGradeSummaryBuilder letterGrade(String letterGrade) { this.letterGrade = letterGrade; return this; }
        public StudentGradeSummaryBuilder atRisk(boolean atRisk) { this.atRisk = atRisk; return this; }
        public StudentGradeSummaryBuilder atRiskReason(String atRiskReason) { this.atRiskReason = atRiskReason; return this; }
        public StudentGradeSummaryBuilder lastCalculatedAt(LocalDateTime lastCalculatedAt) { this.lastCalculatedAt = lastCalculatedAt; return this; }

        public StudentGradeSummary build() {
            StudentGradeSummary s = new StudentGradeSummary();
            s.setId(id); s.setStudent(student); s.setClassroomId(classroomId);
            s.setSubjectName(subjectName); s.setAttendancePercentage(attendancePercentage);
            s.setAssignmentCompletionRate(assignmentCompletionRate); s.setAssessmentAverageScore(assessmentAverageScore);
            s.setCodingScore(codingScore); s.setOverallWeightedGrade(overallWeightedGrade);
            s.setLetterGrade(letterGrade); s.setAtRisk(atRisk); s.setAtRiskReason(atRiskReason);
            s.setLastCalculatedAt(lastCalculatedAt);
            return s;
        }
    }
}
