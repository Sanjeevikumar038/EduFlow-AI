package com.eduflow.dto;

import lombok.*;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceReportRecord {
    private String studentName;
    private String registerNumber;
    private String status; // "PRESENT" or "ABSENT"
    private LocalTime time;
    private Double latitude;
    private Double longitude;

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalTime getTime() { return time; }
    public void setTime(LocalTime time) { this.time = time; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public static AttendanceReportRecordBuilder builder() { return new AttendanceReportRecordBuilder(); }
    public static class AttendanceReportRecordBuilder {
        private String studentName;
        private String registerNumber;
        private String status;
        private LocalTime time;
        private Double latitude;
        private Double longitude;

        public AttendanceReportRecordBuilder studentName(String studentName) { this.studentName = studentName; return this; }
        public AttendanceReportRecordBuilder registerNumber(String registerNumber) { this.registerNumber = registerNumber; return this; }
        public AttendanceReportRecordBuilder status(String status) { this.status = status; return this; }
        public AttendanceReportRecordBuilder time(LocalTime time) { this.time = time; return this; }
        public AttendanceReportRecordBuilder latitude(Double latitude) { this.latitude = latitude; return this; }
        public AttendanceReportRecordBuilder longitude(Double longitude) { this.longitude = longitude; return this; }

        public AttendanceReportRecord build() {
            AttendanceReportRecord r = new AttendanceReportRecord();
            r.setStudentName(studentName); r.setRegisterNumber(registerNumber);
            r.setStatus(status); r.setTime(time);
            r.setLatitude(latitude); r.setLongitude(longitude);
            return r;
        }
    }
}
