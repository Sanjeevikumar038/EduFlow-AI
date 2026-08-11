package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coding_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;
    private String studentName;
    private String studentRegisterNumber;
    
    private java.time.LocalDate date;
    
    private String subject; // e.g. "FREE_ACTIVITY"
    private String problemTitle;

    @Column(columnDefinition = "TEXT")
    private String submittedCode;

    private String language;

    @Column(columnDefinition = "TEXT")
    private String testCaseResultsJson; // details of each test case

    private boolean allPassed;

    @Column(columnDefinition = "TEXT")
    private String aiFeedback; // feedback/review generated from Groq

    private Integer score; // e.g. 100 for all passed, 33 for 1/3 passed

    private LocalDateTime submittedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getStudentRegisterNumber() { return studentRegisterNumber; }
    public void setStudentRegisterNumber(String studentRegisterNumber) { this.studentRegisterNumber = studentRegisterNumber; }
    public java.time.LocalDate getDate() { return date; }
    public void setDate(java.time.LocalDate date) { this.date = date; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getProblemTitle() { return problemTitle; }
    public void setProblemTitle(String problemTitle) { this.problemTitle = problemTitle; }
    public String getSubmittedCode() { return submittedCode; }
    public void setSubmittedCode(String submittedCode) { this.submittedCode = submittedCode; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getTestCaseResultsJson() { return testCaseResultsJson; }
    public void setTestCaseResultsJson(String testCaseResultsJson) { this.testCaseResultsJson = testCaseResultsJson; }
    public boolean isAllPassed() { return allPassed; }
    public void setAllPassed(boolean allPassed) { this.allPassed = allPassed; }
    public String getAiFeedback() { return aiFeedback; }
    public void setAiFeedback(String aiFeedback) { this.aiFeedback = aiFeedback; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public static CodingSubmissionBuilder builder() { return new CodingSubmissionBuilder(); }
    public static class CodingSubmissionBuilder {
        private Long id;
        private Long studentId;
        private String studentName;
        private String studentRegisterNumber;
        private java.time.LocalDate date;
        private String subject;
        private String problemTitle;
        private String submittedCode;
        private String language;
        private String testCaseResultsJson;
        private boolean allPassed;
        private String aiFeedback;
        private Integer score;
        private LocalDateTime submittedAt = LocalDateTime.now();

        public CodingSubmissionBuilder id(Long id) { this.id = id; return this; }
        public CodingSubmissionBuilder studentId(Long studentId) { this.studentId = studentId; return this; }
        public CodingSubmissionBuilder studentName(String studentName) { this.studentName = studentName; return this; }
        public CodingSubmissionBuilder studentRegisterNumber(String studentRegisterNumber) { this.studentRegisterNumber = studentRegisterNumber; return this; }
        public CodingSubmissionBuilder date(java.time.LocalDate date) { this.date = date; return this; }
        public CodingSubmissionBuilder subject(String subject) { this.subject = subject; return this; }
        public CodingSubmissionBuilder problemTitle(String problemTitle) { this.problemTitle = problemTitle; return this; }
        public CodingSubmissionBuilder submittedCode(String submittedCode) { this.submittedCode = submittedCode; return this; }
        public CodingSubmissionBuilder language(String language) { this.language = language; return this; }
        public CodingSubmissionBuilder testCaseResultsJson(String testCaseResultsJson) { this.testCaseResultsJson = testCaseResultsJson; return this; }
        public CodingSubmissionBuilder allPassed(boolean allPassed) { this.allPassed = allPassed; return this; }
        public CodingSubmissionBuilder aiFeedback(String aiFeedback) { this.aiFeedback = aiFeedback; return this; }
        public CodingSubmissionBuilder score(Integer score) { this.score = score; return this; }
        public CodingSubmissionBuilder submittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; return this; }

        public CodingSubmission build() {
            CodingSubmission s = new CodingSubmission();
            s.setId(id); s.setStudentId(studentId); s.setStudentName(studentName);
            s.setStudentRegisterNumber(studentRegisterNumber); s.setDate(date);
            s.setSubject(subject); s.setProblemTitle(problemTitle);
            s.setSubmittedCode(submittedCode); s.setLanguage(language);
            s.setTestCaseResultsJson(testCaseResultsJson); s.setAllPassed(allPassed);
            s.setAiFeedback(aiFeedback); s.setScore(score);
            if (submittedAt != null) s.setSubmittedAt(submittedAt);
            return s;
        }
    }
}
