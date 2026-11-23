package com.example.crop.controller;

import com.example.crop.model.User;
import com.example.crop.security.JwtUtil;
import com.example.crop.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            User user = authService.register(
                    body.get("name"),
                    body.get("email"),
                    body.get("password"),
                    body.get("phone"),
                    body.get("village"),
                    body.get("district"),
                    body.get("state")
            );
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
            return ResponseEntity.ok(Map.of(
                    "message", "Registered successfully",
                    "name", user.getName(),
                    "role", user.getRole().name(),
                    "email", user.getEmail(),
                    "token", token
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String password = body.get("password");
            String role = body.get("role");

            User user = authService.login(email, password, role);
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "name", user.getName(),
                    "role", user.getRole().name(),
                    "email", user.getEmail(),
                    "token", token
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}