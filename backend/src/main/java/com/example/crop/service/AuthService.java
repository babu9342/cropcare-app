package com.example.crop.service;

import com.example.crop.model.User;
import com.example.crop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User register(String name, String email, String password,
                         String phone, String village, String district, String state) {

        if (userRepository.existsByEmail(email))
            throw new RuntimeException("Email already registered");

        User user = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .phone(phone)
                .village(village)
                .district(district)
                .state(state)
                .role(User.Role.FARMER)
                .build();

        return userRepository.save(user);
    }

    public User login(String email, String password, String requestedRole) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        boolean matches = passwordEncoder.matches(password, user.getPassword()) || password.equals(user.getPassword());
        if (!matches) {
            throw new RuntimeException("Invalid email or password");
        }

        if (password.equals(user.getPassword()) && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(password));
            userRepository.save(user);
        }

        if (requestedRole != null && !requestedRole.isBlank()) {
            if (!user.getRole().name().equalsIgnoreCase(requestedRole)) {
                throw new RuntimeException("Access denied: You are registered as " + user.getRole().name());
            }
        }

        return user;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}