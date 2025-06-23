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
    @Autowired
    private com.microhustle.repository.NotificationRepository notificationRepository;
    @Autowired
    private com.microhustle.service.NotificationWebSocketService notificationWebSocketService;
    @Autowired
    private com.microhustle.controller.NotificationController notificationController;

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
        hustler.getAcceptedTasks().add(task);
        userRepository.save(hustler);
        taskRepository.save(task);
        // Create notification for poster
        if (task.getPoster() != null) {
            com.microhustle.model.Notification notif = notificationRepository.save(new com.microhustle.model.Notification(task.getPoster().getId(), task.getId(), hustler.getId()));
            // Build NotificationDTO for WebSocket
            String taskTitle = task.getTitle();
            String hustlerUsername = hustler.getUsername();
            com.microhustle.controller.NotificationController.NotificationDTO dto =
                new com.microhustle.controller.NotificationController.NotificationDTO(
                    notif, taskTitle, hustlerUsername);
            notificationWebSocketService.sendNotificationToPoster(task.getPoster().getId(), dto);
        }
        return ResponseEntity.ok(task);
    }

    @GetMapping
    public List<Task> getTasks() {
        // Only return tasks that are not archived
        return taskRepository.findAll().stream()
            .filter(task -> task.getStatus() == null || !task.getStatus().equalsIgnoreCase("ARCHIVED"))
            .collect(java.util.stream.Collectors.toList());
    }

    // Archive a task (Poster only)
    @PostMapping("/{taskId}/archive")
    public ResponseEntity<?> archiveTask(@PathVariable Long taskId, @RequestParam Long posterId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) {
            return ResponseEntity.badRequest().body("Task not found");
        }
        if (task.getPoster() == null || !task.getPoster().getId().equals(posterId)) {
            return ResponseEntity.status(403).body("Not authorized");
        }
        task.setStatus("ARCHIVED");
        taskRepository.save(task);
        return ResponseEntity.ok("Task archived");
    }

    // Get a single task by id
    @GetMapping("/{taskId}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long taskId) {
        return taskRepository.findById(taskId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get tasks posted by a specific poster
    @GetMapping("/poster/{posterId}")
    public List<Task> getTasksByPoster(@PathVariable Long posterId) {
        return taskRepository.findByPosterId(posterId);
    }

    // Get tasks accepted by a specific hustler
    @GetMapping("/hustler/{hustlerId}")
    public List<Task> getTasksByAcceptedHustler(@PathVariable Long hustlerId) {
        return taskRepository.findByAcceptedHustlers_Id(hustlerId);
    }

    // Mark a hustler as completed for a task
    @PostMapping("/{taskId}/complete")
    public ResponseEntity<?> markHustlerAsCompleted(@PathVariable Long taskId, @RequestParam Long hustlerId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) {
            return ResponseEntity.badRequest().body("Task not found");
        }
        com.microhustle.model.User hustler = userRepository.findById(hustlerId).orElse(null);
        if (hustler == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        if (!task.getAcceptedHustlers().contains(hustler)) {
            return ResponseEntity.badRequest().body("Hustler not accepted for this task");
        }
        task.getCompletedHustlers().add(hustler);
        taskRepository.save(task);
        return ResponseEntity.ok("Marked as completed");
    }
}

