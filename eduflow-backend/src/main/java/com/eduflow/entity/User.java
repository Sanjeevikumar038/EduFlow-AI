package com.eduflow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String department;

    private String year; // Leaving this since it exists, but will add semester as well

    private String registerNumber;

    private String phone;

    private String batch;

    private String section;

    private Integer semester;

    private String dateOfBirth;

    private String gender;

    private String address;

    @Builder.Default
    private Boolean active = true;

    @Builder.Default
    private Boolean classAdvisor = false;

    public boolean isClassAdvisor() {
        return classAdvisor != null && classAdvisor;
    }

    public boolean isActive() {
        return active != null && active;
    }
}
