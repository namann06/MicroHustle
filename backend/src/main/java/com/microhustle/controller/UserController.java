package com.microhustle.controller;

import com.microhustle.model.User;
import com.microhustle.repository.UserRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/register")
    public String registerInfo() {
        return "Use POST to register a new user.";
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userRepository.save(user);
    }

    @PostMapping("/login")
    public org.springframework.http.ResponseEntity<?> login(@RequestBody com.microhustle.model.User loginRequest) {
        com.microhustle.model.User user = userRepository.findByUsername(loginRequest.getUsername());
        if (user == null || !user.getPassword().equals(loginRequest.getPassword())) {
            return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
        return org.springframework.http.ResponseEntity.ok(user);
    }
}
