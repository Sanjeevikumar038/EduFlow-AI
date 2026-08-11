package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "coding_challenges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String department;

    private LocalDate date;

    private Long questionBankId; // reference to CodingQuestionBank

    private String assignedBy;

    private LocalDate assignedDate;

    private boolean active = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public Long getQuestionBankId() { return questionBankId; }
    public void setQuestionBankId(Long questionBankId) { this.questionBankId = questionBankId; }
    public String getAssignedBy() { return assignedBy; }
    public void setAssignedBy(String assignedBy) { this.assignedBy = assignedBy; }
    public LocalDate getAssignedDate() { return assignedDate; }
    public void setAssignedDate(LocalDate assignedDate) { this.assignedDate = assignedDate; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public static CodingChallengeBuilder builder() { return new CodingChallengeBuilder(); }
    public static class CodingChallengeBuilder {
        private Long id;
        private String department;
        private LocalDate date;
        private Long questionBankId;
        private String assignedBy;
        private LocalDate assignedDate;
        private boolean active = true;

        public CodingChallengeBuilder id(Long id) { this.id = id; return this; }
        public CodingChallengeBuilder department(String department) { this.department = department; return this; }
        public CodingChallengeBuilder date(LocalDate date) { this.date = date; return this; }
        public CodingChallengeBuilder questionBankId(Long questionBankId) { this.questionBankId = questionBankId; return this; }
        public CodingChallengeBuilder assignedBy(String assignedBy) { this.assignedBy = assignedBy; return this; }
        public CodingChallengeBuilder assignedDate(LocalDate assignedDate) { this.assignedDate = assignedDate; return this; }
        public CodingChallengeBuilder active(boolean active) { this.active = active; return this; }

        public CodingChallenge build() {
            CodingChallenge c = new CodingChallenge();
            c.setId(id); c.setDepartment(department); c.setDate(date);
            c.setQuestionBankId(questionBankId); c.setAssignedBy(assignedBy);
            c.setAssignedDate(assignedDate); c.setActive(active);
            return c;
        }
    }
}
