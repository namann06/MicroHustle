package com.microhustle.controller;

import com.microhustle.model.Task;
import com.microhustle.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private com.microhustle.repository.UserRepository userRepository;

    @PostMapping
    public Task postTask(@RequestBody Task task) {
        return taskRepository.save(task);
    }

    // Endpoint for a hustler to accept a task
    @PostMapping("/{taskId}/accept")
    public ResponseEntity<?> acceptTask(@PathVariable Long taskId, @RequestParam Long hustlerId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) {
            return ResponseEntity.badRequest().body("Task not found");
        }
        com.microhustle.model.User hustler = userRepository.findById(hustlerId).orElse(null);
        if (hustler == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        if (hustler.getRole() != com.microhustle.model.User.Role.HUSTLER) {
            return ResponseEntity.badRequest().body("Only hustlers can accept tasks");
        }
        task.getAcceptedHustlers().add(hustler);
        taskRepository.save(task);
        return ResponseEntity.ok(task);
    }

    @GetMapping
    public List<Task> getTasks() {
        return taskRepository.findAll();
    }
}
