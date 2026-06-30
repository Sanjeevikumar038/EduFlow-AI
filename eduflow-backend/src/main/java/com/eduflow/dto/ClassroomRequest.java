package com.eduflow.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClassroomRequest {
    private String roomCode;
    private String roomName;
    private Integer capacity;
    private String roomType; // "LAB", "LECTURE", "SEMINAR"
}
