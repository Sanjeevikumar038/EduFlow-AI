package com.eduflow.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableSuggestionResponse {
    private String suggestedSubject;
    private Integer period;
    private String startTime;
    private String endTime;
}
