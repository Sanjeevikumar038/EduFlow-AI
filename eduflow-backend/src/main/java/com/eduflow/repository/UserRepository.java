package com.eduflow.repository;

import com.eduflow.entity.Role;
import com.eduflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    Optional<User> findByRegisterNumber(String registerNumber);
    Optional<User> findByName(String name);
    List<User> findByRole(Role role);
    long countByRole(Role role);
    List<User> findByRoleAndDepartmentIgnoreCase(Role role, String department);
    List<User> findByRoleAndDepartment(Role role, String department);
    List<User> findByRoleOrderByNameAsc(Role role);
    List<User> findByDepartmentAndSemesterAndRole(String department, Integer semester, Role role);
    List<User> findByDepartmentAndRole(String department, Role role);
}
