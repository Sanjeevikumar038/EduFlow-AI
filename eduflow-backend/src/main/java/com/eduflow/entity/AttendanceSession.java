package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String subject;

    private Long facultyId;

    private LocalDateTime startTime;

    private LocalDateTime expiryTime;

    private boolean active;

    @Transient
    private String currentOtp;

    @Transient
    private String facultyName;
}

