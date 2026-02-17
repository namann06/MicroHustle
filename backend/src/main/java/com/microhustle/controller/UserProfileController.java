package com.microhustle.controller;

import com.microhustle.model.User;
import com.microhustle.model.Task;
import com.microhustle.model.HustlerRating;
import com.microhustle.repository.UserRepository;
import com.microhustle.repository.TaskRepository;
import com.microhustle.repository.HustlerRatingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.*;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private HustlerRatingRepository hustlerRatingRepository;

    @GetMapping("/{id}/profile")
    public Map<String, Object> getProfile(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) return Collections.singletonMap("error", "User not found");
        User user = userOpt.get();
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("role", user.getRole());
        profile.put("bio", user.getBio());
        profile.put("profilePicUrl", user.getProfilePicUrl());
        return profile;
    }

    // Public profile by username
    @GetMapping("/public/{username}")
    public ResponseEntity<?> getPublicProfile(@PathVariable String username) {
        User user = userRepository.findFirstByUsername(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "User not found"));
        }
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("role", user.getRole());
        profile.put("bio", user.getBio());
        profile.put("profilePicUrl", user.getProfilePicUrl());
        return ResponseEntity.ok(profile);
    }

    // Update profile (bio, profilePicUrl)
    @RequestMapping(value = "/{id}/profile", method = {RequestMethod.POST, RequestMethod.PUT})
    public Map<String, Object> updateProfile(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        System.out.println("[DEBUG] Received profile update for user id: " + id);
        System.out.println("[DEBUG] Payload: " + payload);
        try {
            Optional<User> userOpt = userRepository.findById(id);
            if (!userOpt.isPresent()) return Collections.singletonMap("error", "User not found");
            User user = userOpt.get();
            if (payload.containsKey("bio")) user.setBio(payload.get("bio"));
            if (payload.containsKey("profilePicUrl")) user.setProfilePicUrl(payload.get("profilePicUrl"));
            userRepository.save(user);
            System.out.println("[DEBUG] Profile updated successfully for user id: " + id);
            return Collections.singletonMap("success", true);
        } catch (Exception e) {
            System.out.println("[ERROR] Failed to update profile: " + e.getMessage());
            e.printStackTrace();
            return Collections.singletonMap("error", "Exception: " + e.getMessage());
        }
    }

    // For posters: list of posted tasks
    @GetMapping("/{id}/poster-tasks")
    public List<Task> getPostedTasks(@PathVariable Long id) {
        return taskRepository.findByPosterId(id);
    }

    // For hustlers: list of completed tasks
    @GetMapping("/{id}/hustler-completed-tasks")
    public List<Task> getCompletedTasks(@PathVariable Long id) {
        List<Task> allTasks = taskRepository.findByAcceptedHustlers_Id(id);
        List<Task> completed = new ArrayList<>();
        for (Task t : allTasks) {
            if (t.getCompletedHustlers() != null) {
                for (User h : t.getCompletedHustlers()) {
                    if (h.getId().equals(id)) {
                        completed.add(t);
                        break;
                    }
                }
            }
        }
        return completed;
    }

    // For hustlers: ratings received
    @GetMapping("/{id}/hustler-ratings")
    public Map<String, Object> getHustlerRatings(@PathVariable Long id) {
        List<HustlerRating> ratings = hustlerRatingRepository.findByHustlerId(id);
        double avg = ratings.stream().mapToInt(HustlerRating::getRating).average().orElse(0);
        Map<String, Object> result = new HashMap<>();
        result.put("average", avg);
        result.put("ratings", ratings);
        return result;
    }
}
