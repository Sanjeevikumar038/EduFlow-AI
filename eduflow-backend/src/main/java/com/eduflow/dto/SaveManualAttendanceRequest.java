package com.eduflow.dto;

import lombok.Data;
import java.util.List;

@Data
public class SaveManualAttendanceRequest {
    private String date;
    private String startTime;
    private String endTime;
    private String subject;
    private String department;
    private Integer semester;
    private String section;
    private List<ManualMarkRequest> records;

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public List<ManualMarkRequest> getRecords() { return records; }
    public void setRecords(List<ManualMarkRequest> records) { this.records = records; }
}
