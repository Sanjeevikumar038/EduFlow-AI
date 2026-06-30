package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "classrooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String roomCode;

    private String roomName;

    private Integer capacity;

    // e.g., "LAB", "LECTURE", "SEMINAR"
    private String roomType;

    @Builder.Default
    private boolean active = true;
}
