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
        private boolean classAdvisor;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder id(Long id) { this.id = id; return this; }
        public AuthResponseBuilder email(String email) { this.email = email; return this; }
        public AuthResponseBuilder role(Role role) { this.role = role; return this; }
        public AuthResponseBuilder name(String name) { this.name = name; return this; }
        public AuthResponseBuilder registerNumber(String registerNumber) { this.registerNumber = registerNumber; return this; }
        public AuthResponseBuilder department(String department) { this.department = department; return this; }
        public AuthResponseBuilder classAdvisor(boolean classAdvisor) { this.classAdvisor = classAdvisor; return this; }

        public AuthResponse build() {
            AuthResponse r = new AuthResponse();
            r.setToken(token); r.setId(id); r.setEmail(email);
            r.setRole(role); r.setName(name); r.setRegisterNumber(registerNumber);
            r.setDepartment(department); r.setClassAdvisor(classAdvisor);
            return r;
        }
    }
}
