package com.eduflow.repository;

import com.eduflow.entity.Role;
import com.eduflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    Optional<User> findByName(String name);
    List<User> findByRole(Role role);
    List<User> findByRoleAndDepartmentIgnoreCase(Role role, String department);
}
