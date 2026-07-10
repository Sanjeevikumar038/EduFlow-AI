package com.eduflow.security;

import com.eduflow.entity.User;
import com.eduflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(usernameOrEmail)
                .or(() -> userRepository.findByRegisterNumber(usernameOrEmail))
                .orElseGet(() -> userRepository.findByName(usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email or register number: " + usernameOrEmail)));
        return new CustomUserDetails(user);
    }
}
