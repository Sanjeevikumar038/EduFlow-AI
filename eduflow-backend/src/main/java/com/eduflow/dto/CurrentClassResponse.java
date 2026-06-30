package com.eduflow.dto;

import com.eduflow.entity.TimetableEntry;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurrentClassResponse {
    private TimetableEntry currentClass;
    private TimetableEntry nextClass;
    private Integer periodNumber;
    private String status; // "CLASS", "BREAK", "LUNCH", "FREE", "ENDED", "WEEKEND", "BEFORE_COLLEGE"
    private Long timeRemainingMinutes;
    private Long elapsedMinutes;
    private Long totalPeriodMinutes;
    private List<PeriodDetails> todayTimeline;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PeriodDetails {
        private Integer period;
        private String subject;
        private String facultyName;
        private String startTime;
        private String endTime;
        private boolean isActive;
        private boolean isCompleted;
    }
}
