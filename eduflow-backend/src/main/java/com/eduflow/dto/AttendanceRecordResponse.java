package com.eduflow.dto;

import lombok.*;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecordResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String registerNumber;
    private LocalTime time;
    private String status;
    private Double latitude;
    private Double longitude;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }
    public LocalTime getTime() { return time; }
    public void setTime(LocalTime time) { this.time = time; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public static AttendanceRecordResponseBuilder builder() { return new AttendanceRecordResponseBuilder(); }
    public static class AttendanceRecordResponseBuilder {
        private Long id;
        private Long studentId;
        private String studentName;
        private String registerNumber;
        private LocalTime time;
        private String status;
        private Double latitude;
        private Double longitude;

        public AttendanceRecordResponseBuilder id(Long id) { this.id = id; return this; }
        public AttendanceRecordResponseBuilder studentId(Long studentId) { this.studentId = studentId; return this; }
        public AttendanceRecordResponseBuilder studentName(String studentName) { this.studentName = studentName; return this; }
        public AttendanceRecordResponseBuilder registerNumber(String registerNumber) { this.registerNumber = registerNumber; return this; }
        public AttendanceRecordResponseBuilder time(LocalTime time) { this.time = time; return this; }
        public AttendanceRecordResponseBuilder status(String status) { this.status = status; return this; }
        public AttendanceRecordResponseBuilder latitude(Double latitude) { this.latitude = latitude; return this; }
        public AttendanceRecordResponseBuilder longitude(Double longitude) { this.longitude = longitude; return this; }

        public AttendanceRecordResponse build() {
            AttendanceRecordResponse r = new AttendanceRecordResponse();
            r.setId(id); r.setStudentId(studentId); r.setStudentName(studentName);
            r.setRegisterNumber(registerNumber); r.setTime(time); r.setStatus(status);
            r.setLatitude(latitude); r.setLongitude(longitude);
            return r;
        }
    }
}
