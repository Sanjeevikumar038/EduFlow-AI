package com.eduflow.dto;

public class TimetableSuggestionResponse {
    private String suggestedSubject;
    private Integer period;
    private String startTime;
    private String endTime;

    public TimetableSuggestionResponse() {}

    public TimetableSuggestionResponse(String suggestedSubject, Integer period, String startTime, String endTime) {
        this.suggestedSubject = suggestedSubject;
        this.period = period;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public String getSuggestedSubject() { return suggestedSubject; }
    public void setSuggestedSubject(String suggestedSubject) { this.suggestedSubject = suggestedSubject; }
    public Integer getPeriod() { return period; }
    public void setPeriod(Integer period) { this.period = period; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public static TimetableSuggestionResponseBuilder builder() { return new TimetableSuggestionResponseBuilder(); }
    public static class TimetableSuggestionResponseBuilder {
        private String suggestedSubject;
        private Integer period;
        private String startTime;
        private String endTime;

        public TimetableSuggestionResponseBuilder suggestedSubject(String suggestedSubject) { this.suggestedSubject = suggestedSubject; return this; }
        public TimetableSuggestionResponseBuilder period(Integer period) { this.period = period; return this; }
        public TimetableSuggestionResponseBuilder startTime(String startTime) { this.startTime = startTime; return this; }
        public TimetableSuggestionResponseBuilder endTime(String endTime) { this.endTime = endTime; return this; }

        public TimetableSuggestionResponse build() {
            TimetableSuggestionResponse r = new TimetableSuggestionResponse();
            r.setSuggestedSubject(suggestedSubject); r.setPeriod(period);
            r.setStartTime(startTime); r.setEndTime(endTime);
            return r;
        }
    }
}
