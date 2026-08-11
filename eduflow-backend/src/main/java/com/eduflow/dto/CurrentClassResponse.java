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

    public TimetableEntry getCurrentClass() { return currentClass; }
    public void setCurrentClass(TimetableEntry currentClass) { this.currentClass = currentClass; }
    public TimetableEntry getNextClass() { return nextClass; }
    public void setNextClass(TimetableEntry nextClass) { this.nextClass = nextClass; }
    public Integer getPeriodNumber() { return periodNumber; }
    public void setPeriodNumber(Integer periodNumber) { this.periodNumber = periodNumber; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getTimeRemainingMinutes() { return timeRemainingMinutes; }
    public void setTimeRemainingMinutes(Long timeRemainingMinutes) { this.timeRemainingMinutes = timeRemainingMinutes; }
    public Long getElapsedMinutes() { return elapsedMinutes; }
    public void setElapsedMinutes(Long elapsedMinutes) { this.elapsedMinutes = elapsedMinutes; }
    public Long getTotalPeriodMinutes() { return totalPeriodMinutes; }
    public void setTotalPeriodMinutes(Long totalPeriodMinutes) { this.totalPeriodMinutes = totalPeriodMinutes; }
    public List<PeriodDetails> getTodayTimeline() { return todayTimeline; }
    public void setTodayTimeline(List<PeriodDetails> todayTimeline) { this.todayTimeline = todayTimeline; }

    public static CurrentClassResponseBuilder builder() { return new CurrentClassResponseBuilder(); }
    public static class CurrentClassResponseBuilder {
        private TimetableEntry currentClass;
        private TimetableEntry nextClass;
        private Integer periodNumber;
        private String status;
        private Long timeRemainingMinutes;
        private Long elapsedMinutes;
        private Long totalPeriodMinutes;
        private List<PeriodDetails> todayTimeline;

        public CurrentClassResponseBuilder currentClass(TimetableEntry currentClass) { this.currentClass = currentClass; return this; }
        public CurrentClassResponseBuilder nextClass(TimetableEntry nextClass) { this.nextClass = nextClass; return this; }
        public CurrentClassResponseBuilder periodNumber(Integer periodNumber) { this.periodNumber = periodNumber; return this; }
        public CurrentClassResponseBuilder status(String status) { this.status = status; return this; }
        public CurrentClassResponseBuilder timeRemainingMinutes(Long timeRemainingMinutes) { this.timeRemainingMinutes = timeRemainingMinutes; return this; }
        public CurrentClassResponseBuilder elapsedMinutes(Long elapsedMinutes) { this.elapsedMinutes = elapsedMinutes; return this; }
        public CurrentClassResponseBuilder totalPeriodMinutes(Long totalPeriodMinutes) { this.totalPeriodMinutes = totalPeriodMinutes; return this; }
        public CurrentClassResponseBuilder todayTimeline(List<PeriodDetails> todayTimeline) { this.todayTimeline = todayTimeline; return this; }

        public CurrentClassResponse build() {
            CurrentClassResponse r = new CurrentClassResponse();
            r.setCurrentClass(currentClass); r.setNextClass(nextClass);
            r.setPeriodNumber(periodNumber); r.setStatus(status);
            r.setTimeRemainingMinutes(timeRemainingMinutes); r.setElapsedMinutes(elapsedMinutes);
            r.setTotalPeriodMinutes(totalPeriodMinutes); r.setTodayTimeline(todayTimeline);
            return r;
        }
    }

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

        public Integer getPeriod() { return period; }
        public void setPeriod(Integer period) { this.period = period; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getFacultyName() { return facultyName; }
        public void setFacultyName(String facultyName) { this.facultyName = facultyName; }
        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }
        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }
        public boolean isActive() { return isActive; }
        public void setActive(boolean active) { isActive = active; }
        public boolean isCompleted() { return isCompleted; }
        public void setCompleted(boolean completed) { isCompleted = completed; }

        public static PeriodDetailsBuilder builder() { return new PeriodDetailsBuilder(); }
        public static class PeriodDetailsBuilder {
            private Integer period;
            private String subject;
            private String facultyName;
            private String startTime;
            private String endTime;
            private boolean isActive;
            private boolean isCompleted;

            public PeriodDetailsBuilder period(Integer period) { this.period = period; return this; }
            public PeriodDetailsBuilder subject(String subject) { this.subject = subject; return this; }
            public PeriodDetailsBuilder facultyName(String facultyName) { this.facultyName = facultyName; return this; }
            public PeriodDetailsBuilder startTime(String startTime) { this.startTime = startTime; return this; }
            public PeriodDetailsBuilder endTime(String endTime) { this.endTime = endTime; return this; }
            public PeriodDetailsBuilder isActive(boolean isActive) { this.isActive = isActive; return this; }
            public PeriodDetailsBuilder isCompleted(boolean isCompleted) { this.isCompleted = isCompleted; return this; }

            public PeriodDetails build() {
                PeriodDetails p = new PeriodDetails();
                p.setPeriod(period); p.setSubject(subject); p.setFacultyName(facultyName);
                p.setStartTime(startTime); p.setEndTime(endTime);
                p.setActive(isActive); p.setCompleted(isCompleted);
                return p;
            }
        }
    }
}
