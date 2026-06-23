package com.eduflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MarkAttendanceRequest {

    @NotNull(message = "Session ID is required")
    private Long sessionId;

    @NotBlank(message = "OTP is required")
    private String otp;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;
}
