package com.microhustle.controller;

import com.microhustle.config.JwtUtil;
import com.microhustle.model.User;
import com.microhustle.repository.UserRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // Check if username already exists
        if (userRepository.findFirstByUsername(user.getUsername()) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Username already taken"));
        }

        // Hash the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getUsername(),
                savedUser.getRole().name());

        // Return token + user data (password excluded via @JsonIgnore)
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", savedUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        User user = userRepository.findFirstByUsername(loginRequest.getUsername());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        }

        boolean authenticated = false;
        String storedPassword = user.getPassword();

        if (storedPassword != null && storedPassword.startsWith("$2a$")) {
            // Password is already BCrypt-encoded — use normal matching
            authenticated = passwordEncoder.matches(loginRequest.getPassword(), storedPassword);
        } else {
            // Legacy plain-text password — compare directly, then migrate to BCrypt
            authenticated = loginRequest.getPassword().equals(storedPassword);
            if (authenticated) {
                user.setPassword(passwordEncoder.encode(loginRequest.getPassword()));
                userRepository.save(user);
            }
        }

        if (!authenticated) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        }

        // Generate JWT token
        String roleName = user.getRole() != null ? user.getRole().name() : "HUSTLER";
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(),
                roleName);

        // Return token + user data
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);
        return ResponseEntity.ok(response);
    }
}
