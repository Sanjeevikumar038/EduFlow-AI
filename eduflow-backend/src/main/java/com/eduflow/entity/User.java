package com.eduflow.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
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

    private String year;

    private String registerNumber;

    private String phone;

    private String batch;

    private String section;

    private Integer semester;

    private String dateOfBirth;

    private String gender;

    private String address;

    private Boolean active = true;

    private Boolean classAdvisor = false;

    private Boolean hod = false;

    private Integer defaultWorkloadHours;

    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public User(Long id, String name, String email, String password, Role role, String department,
                String year, String registerNumber, String phone, String batch, String section,
                Integer semester, String dateOfBirth, String gender, String address,
                Boolean active, Boolean classAdvisor, Boolean hod, Integer defaultWorkloadHours, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.department = department;
        this.year = year;
        this.registerNumber = registerNumber;
        this.phone = phone;
        this.batch = batch;
        this.section = section;
        this.semester = semester;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.address = address;
        this.active = active;
        this.classAdvisor = classAdvisor;
        this.hod = hod;
        this.defaultWorkloadHours = defaultWorkloadHours;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public Boolean getClassAdvisor() { return classAdvisor; }
    public void setClassAdvisor(Boolean classAdvisor) { this.classAdvisor = classAdvisor; }
    public Boolean getHod() { return hod; }
    public void setHod(Boolean hod) { this.hod = hod; }
    public Integer getDefaultWorkloadHours() { return defaultWorkloadHours; }
    public void setDefaultWorkloadHours(Integer defaultWorkloadHours) { this.defaultWorkloadHours = defaultWorkloadHours; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isClassAdvisor() { return classAdvisor != null && classAdvisor; }
    public boolean isHod() { return hod != null && hod; }
    public boolean isActive() { return active != null && active; }

    // Builder
    public static UserBuilder builder() { return new UserBuilder(); }
    public static class UserBuilder {
        private Long id;
        private String name;
        private String email;
        private String password;
        private String department;
        private Role role;
        private String year;
        private String registerNumber;
        private String phone;
        private String batch;
        private String section;
        private Integer semester;
        private String dateOfBirth;
        private String gender;
        private String address;
        private Boolean active = true;
        private Boolean classAdvisor = false;
        private Boolean hod = false;
        private Integer defaultWorkloadHours = 0;
        private LocalDateTime createdAt = LocalDateTime.now();

        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder department(String department) { this.department = department; return this; }
        public UserBuilder role(Role role) { this.role = role; return this; }
        public UserBuilder year(String year) { this.year = year; return this; }
        public UserBuilder registerNumber(String registerNumber) { this.registerNumber = registerNumber; return this; }
        public UserBuilder phone(String phone) { this.phone = phone; return this; }
        public UserBuilder batch(String batch) { this.batch = batch; return this; }
        public UserBuilder section(String section) { this.section = section; return this; }
        public UserBuilder semester(Integer semester) { this.semester = semester; return this; }
        public UserBuilder dateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; return this; }
        public UserBuilder gender(String gender) { this.gender = gender; return this; }
        public UserBuilder address(String address) { this.address = address; return this; }
        public UserBuilder active(Boolean active) { this.active = active; return this; }
        public UserBuilder classAdvisor(Boolean classAdvisor) { this.classAdvisor = classAdvisor; return this; }
        public UserBuilder hod(Boolean hod) { this.hod = hod; return this; }
        public UserBuilder defaultWorkloadHours(Integer defaultWorkloadHours) { this.defaultWorkloadHours = defaultWorkloadHours; return this; }
        public UserBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public User build() {
            User u = new User();
            u.setId(id); u.setName(name); u.setEmail(email); u.setPassword(password);
            u.setDepartment(department); u.setRole(role); u.setYear(year);
            u.setRegisterNumber(registerNumber); u.setPhone(phone); u.setBatch(batch);
            u.setSection(section); u.setSemester(semester); u.setDateOfBirth(dateOfBirth);
            u.setGender(gender); u.setAddress(address); u.setActive(active);
            u.setClassAdvisor(classAdvisor); u.setHod(hod);
            if (defaultWorkloadHours != null) u.setDefaultWorkloadHours(defaultWorkloadHours);
            if (createdAt != null) u.setCreatedAt(createdAt);
            return u;
        }
    }
}
