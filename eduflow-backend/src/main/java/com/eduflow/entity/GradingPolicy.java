package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "grading_policies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradingPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String department;

    private Integer semester;

    private Long classroomId; // If subject-specific policy, otherwise default

    @Builder.Default
    private Double attendanceWeight = 0.10; // 10%

    @Builder.Default
    private Double assignmentWeight = 0.30; // 30%

    @Builder.Default
    private Double assessmentWeight = 0.40; // 40%

    @Builder.Default
    private Double codingWeight = 0.20; // 20%

    @Builder.Default
    private Double passPercentage = 40.0;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public Long getClassroomId() { return classroomId; }
    public void setClassroomId(Long classroomId) { this.classroomId = classroomId; }
    public Double getAttendanceWeight() { return attendanceWeight; }
    public void setAttendanceWeight(Double attendanceWeight) { this.attendanceWeight = attendanceWeight; }
    public Double getAssignmentWeight() { return assignmentWeight; }
    public void setAssignmentWeight(Double assignmentWeight) { this.assignmentWeight = assignmentWeight; }
    public Double getAssessmentWeight() { return assessmentWeight; }
    public void setAssessmentWeight(Double assessmentWeight) { this.assessmentWeight = assessmentWeight; }
    public Double getCodingWeight() { return codingWeight; }
    public void setCodingWeight(Double codingWeight) { this.codingWeight = codingWeight; }
    public Double getPassPercentage() { return passPercentage; }
    public void setPassPercentage(Double passPercentage) { this.passPercentage = passPercentage; }

    public static GradingPolicyBuilder builder() { return new GradingPolicyBuilder(); }
    public static class GradingPolicyBuilder {
        private Long id;
        private String department;
        private Integer semester;
        private Long classroomId;
        private Double attendanceWeight = 0.10;
        private Double assignmentWeight = 0.30;
        private Double assessmentWeight = 0.40;
        private Double codingWeight = 0.20;
        private Double passPercentage = 40.0;

        public GradingPolicyBuilder id(Long id) { this.id = id; return this; }
        public GradingPolicyBuilder department(String department) { this.department = department; return this; }
        public GradingPolicyBuilder semester(Integer semester) { this.semester = semester; return this; }
        public GradingPolicyBuilder classroomId(Long classroomId) { this.classroomId = classroomId; return this; }
        public GradingPolicyBuilder attendanceWeight(Double attendanceWeight) { this.attendanceWeight = attendanceWeight; return this; }
        public GradingPolicyBuilder assignmentWeight(Double assignmentWeight) { this.assignmentWeight = assignmentWeight; return this; }
        public GradingPolicyBuilder assessmentWeight(Double assessmentWeight) { this.assessmentWeight = assessmentWeight; return this; }
        public GradingPolicyBuilder codingWeight(Double codingWeight) { this.codingWeight = codingWeight; return this; }
        public GradingPolicyBuilder passPercentage(Double passPercentage) { this.passPercentage = passPercentage; return this; }

        public GradingPolicy build() {
            GradingPolicy p = new GradingPolicy();
            p.setId(id); p.setDepartment(department); p.setSemester(semester);
            p.setClassroomId(classroomId); p.setAttendanceWeight(attendanceWeight);
            p.setAssignmentWeight(assignmentWeight); p.setAssessmentWeight(assessmentWeight);
            p.setCodingWeight(codingWeight); p.setPassPercentage(passPercentage);
            return p;
        }
    }
}
