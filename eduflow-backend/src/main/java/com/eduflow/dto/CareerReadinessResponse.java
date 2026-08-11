package com.eduflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareerReadinessResponse {
    private Integer attendanceScore;
    private Integer resumeScore;
    private Integer codingScore;
    private Integer interviewScore;
    private Integer overallCareerScore;
    private String status;
    private List<String> recommendations;
    
    // New Interview Metrics
    private Integer lastInterviewScore;
    private Integer bestInterviewScore;
    private Integer interviewStreak;
    private String strongestDomain;
    
    // New counts for dashboard
    private Integer totalMockSessions;
    private Integer totalCodingSolved;

    public Integer getAttendanceScore() { return attendanceScore; }
    public void setAttendanceScore(Integer attendanceScore) { this.attendanceScore = attendanceScore; }
    public Integer getResumeScore() { return resumeScore; }
    public void setResumeScore(Integer resumeScore) { this.resumeScore = resumeScore; }
    public Integer getCodingScore() { return codingScore; }
    public void setCodingScore(Integer codingScore) { this.codingScore = codingScore; }
    public Integer getInterviewScore() { return interviewScore; }
    public void setInterviewScore(Integer interviewScore) { this.interviewScore = interviewScore; }
    public Integer getOverallCareerScore() { return overallCareerScore; }
    public void setOverallCareerScore(Integer overallCareerScore) { this.overallCareerScore = overallCareerScore; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
    public Integer getLastInterviewScore() { return lastInterviewScore; }
    public void setLastInterviewScore(Integer lastInterviewScore) { this.lastInterviewScore = lastInterviewScore; }
    public Integer getBestInterviewScore() { return bestInterviewScore; }
    public void setBestInterviewScore(Integer bestInterviewScore) { this.bestInterviewScore = bestInterviewScore; }
    public Integer getInterviewStreak() { return interviewStreak; }
    public void setInterviewStreak(Integer interviewStreak) { this.interviewStreak = interviewStreak; }
    public String getStrongestDomain() { return strongestDomain; }
    public void setStrongestDomain(String strongestDomain) { this.strongestDomain = strongestDomain; }
    public Integer getTotalMockSessions() { return totalMockSessions; }
    public void setTotalMockSessions(Integer totalMockSessions) { this.totalMockSessions = totalMockSessions; }
    public Integer getTotalCodingSolved() { return totalCodingSolved; }
    public void setTotalCodingSolved(Integer totalCodingSolved) { this.totalCodingSolved = totalCodingSolved; }

    public static CareerReadinessResponseBuilder builder() { return new CareerReadinessResponseBuilder(); }
    public static class CareerReadinessResponseBuilder {
        private Integer attendanceScore;
        private Integer resumeScore;
        private Integer codingScore;
        private Integer interviewScore;
        private Integer overallCareerScore;
        private String status;
        private List<String> recommendations;
        private Integer lastInterviewScore;
        private Integer bestInterviewScore;
        private Integer interviewStreak;
        private String strongestDomain;
        private Integer totalMockSessions;
        private Integer totalCodingSolved;

        public CareerReadinessResponseBuilder attendanceScore(Integer attendanceScore) { this.attendanceScore = attendanceScore; return this; }
        public CareerReadinessResponseBuilder resumeScore(Integer resumeScore) { this.resumeScore = resumeScore; return this; }
        public CareerReadinessResponseBuilder codingScore(Integer codingScore) { this.codingScore = codingScore; return this; }
        public CareerReadinessResponseBuilder interviewScore(Integer interviewScore) { this.interviewScore = interviewScore; return this; }
        public CareerReadinessResponseBuilder overallCareerScore(Integer overallCareerScore) { this.overallCareerScore = overallCareerScore; return this; }
        public CareerReadinessResponseBuilder status(String status) { this.status = status; return this; }
        public CareerReadinessResponseBuilder recommendations(List<String> recommendations) { this.recommendations = recommendations; return this; }
        public CareerReadinessResponseBuilder lastInterviewScore(Integer lastInterviewScore) { this.lastInterviewScore = lastInterviewScore; return this; }
        public CareerReadinessResponseBuilder bestInterviewScore(Integer bestInterviewScore) { this.bestInterviewScore = bestInterviewScore; return this; }
        public CareerReadinessResponseBuilder interviewStreak(Integer interviewStreak) { this.interviewStreak = interviewStreak; return this; }
        public CareerReadinessResponseBuilder strongestDomain(String strongestDomain) { this.strongestDomain = strongestDomain; return this; }
        public CareerReadinessResponseBuilder totalMockSessions(Integer totalMockSessions) { this.totalMockSessions = totalMockSessions; return this; }
        public CareerReadinessResponseBuilder totalCodingSolved(Integer totalCodingSolved) { this.totalCodingSolved = totalCodingSolved; return this; }

        public CareerReadinessResponse build() {
            CareerReadinessResponse r = new CareerReadinessResponse();
            r.setAttendanceScore(attendanceScore); r.setResumeScore(resumeScore);
            r.setCodingScore(codingScore); r.setInterviewScore(interviewScore);
            r.setOverallCareerScore(overallCareerScore); r.setStatus(status);
            r.setRecommendations(recommendations); r.setLastInterviewScore(lastInterviewScore);
            r.setBestInterviewScore(bestInterviewScore); r.setInterviewStreak(interviewStreak);
            r.setStrongestDomain(strongestDomain); r.setTotalMockSessions(totalMockSessions);
            r.setTotalCodingSolved(totalCodingSolved);
            return r;
        }
    }
}
