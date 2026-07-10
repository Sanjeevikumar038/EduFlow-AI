package com.eduflow.dto;

import lombok.Data;
import java.util.List;

@Data
public class SaveManualAttendanceRequest {
    private String date;
    private String startTime;
    private String endTime;
    private String subject;
    private List<ManualMarkRequest> records;
}
