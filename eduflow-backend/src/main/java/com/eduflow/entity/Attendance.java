package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "attendance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;

    private Long sessionId;

    private LocalDate date;

    private LocalTime time;

    private String status;

    private Double latitude;

    private Double longitude;

    private String method; // QR or MANUAL

    private String remarks;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalTime getTime() { return time; }
    public void setTime(LocalTime time) { this.time = time; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public static AttendanceBuilder builder() { return new AttendanceBuilder(); }
    public static class AttendanceBuilder {
        private Long id;
        private Long studentId;
        private Long sessionId;
        private LocalDate date;
        private LocalTime time;
        private String status;
        private Double latitude;
        private Double longitude;
        private String method;
        private String remarks;

        public AttendanceBuilder id(Long id) { this.id = id; return this; }
        public AttendanceBuilder studentId(Long studentId) { this.studentId = studentId; return this; }
        public AttendanceBuilder sessionId(Long sessionId) { this.sessionId = sessionId; return this; }
        public AttendanceBuilder date(LocalDate date) { this.date = date; return this; }
        public AttendanceBuilder time(LocalTime time) { this.time = time; return this; }
        public AttendanceBuilder status(String status) { this.status = status; return this; }
        public AttendanceBuilder latitude(Double latitude) { this.latitude = latitude; return this; }
        public AttendanceBuilder longitude(Double longitude) { this.longitude = longitude; return this; }
        public AttendanceBuilder method(String method) { this.method = method; return this; }
        public AttendanceBuilder remarks(String remarks) { this.remarks = remarks; return this; }

        public Attendance build() {
            Attendance a = new Attendance();
            a.setId(id); a.setStudentId(studentId); a.setSessionId(sessionId);
            a.setDate(date); a.setTime(time); a.setStatus(status);
            a.setLatitude(latitude); a.setLongitude(longitude); a.setMethod(method); a.setRemarks(remarks);
            return a;
        }
    }
}
