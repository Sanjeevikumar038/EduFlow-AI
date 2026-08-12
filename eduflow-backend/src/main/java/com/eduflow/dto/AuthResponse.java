package com.eduflow.dto;

import com.eduflow.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long id;
    private String email;
    private Role role;
    private String name;
    private String registerNumber;
    private String department;
    private String section;
    private Integer semester;
    private String year;
    private String batch;
    private boolean classAdvisor;

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }
    public boolean isClassAdvisor() { return classAdvisor; }
    public void setClassAdvisor(boolean classAdvisor) { this.classAdvisor = classAdvisor; }

    public static AuthResponseBuilder builder() { return new AuthResponseBuilder(); }
    public static class AuthResponseBuilder {
        private String token;
        private Long id;
        private String email;
        private Role role;
        private String name;
        private String registerNumber;
        private String department;
        private String section;
        private Integer semester;
        private String year;
        private String batch;
        private boolean classAdvisor;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder id(Long id) { this.id = id; return this; }
        public AuthResponseBuilder email(String email) { this.email = email; return this; }
        public AuthResponseBuilder role(Role role) { this.role = role; return this; }
        public AuthResponseBuilder name(String name) { this.name = name; return this; }
        public AuthResponseBuilder registerNumber(String registerNumber) { this.registerNumber = registerNumber; return this; }
        public AuthResponseBuilder department(String department) { this.department = department; return this; }
        public AuthResponseBuilder section(String section) { this.section = section; return this; }
        public AuthResponseBuilder semester(Integer semester) { this.semester = semester; return this; }
        public AuthResponseBuilder year(String year) { this.year = year; return this; }
        public AuthResponseBuilder batch(String batch) { this.batch = batch; return this; }
        public AuthResponseBuilder classAdvisor(boolean classAdvisor) { this.classAdvisor = classAdvisor; return this; }

        public AuthResponse build() {
            return new AuthResponse(token, id, email, role, name, registerNumber, department, section, semester, year, batch, classAdvisor);
        }
    }
}
