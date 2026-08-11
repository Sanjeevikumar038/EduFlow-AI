package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "faculty_availability")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = false)
    private User faculty;

    @Column(nullable = false)
    private LocalDate date;

    @Builder.Default
    private Boolean available = false; // false = on leave

    private String reason;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getFaculty() { return faculty; }
    public void setFaculty(User faculty) { this.faculty = faculty; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public static FacultyAvailabilityBuilder builder() { return new FacultyAvailabilityBuilder(); }
    public static class FacultyAvailabilityBuilder {
        private Long id;
        private User faculty;
        private LocalDate date;
        private Boolean available = false;
        private String reason;

        public FacultyAvailabilityBuilder id(Long id) { this.id = id; return this; }
        public FacultyAvailabilityBuilder faculty(User faculty) { this.faculty = faculty; return this; }
        public FacultyAvailabilityBuilder date(LocalDate date) { this.date = date; return this; }
        public FacultyAvailabilityBuilder available(Boolean available) { this.available = available; return this; }
        public FacultyAvailabilityBuilder reason(String reason) { this.reason = reason; return this; }

        public FacultyAvailability build() {
            FacultyAvailability fa = new FacultyAvailability();
            fa.setId(id); fa.setFaculty(faculty); fa.setDate(date); fa.setAvailable(available); fa.setReason(reason);
            return fa;
        }
    }
}
