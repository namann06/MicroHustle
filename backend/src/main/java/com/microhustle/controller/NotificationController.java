package com.microhustle.controller;

import com.microhustle.model.Notification;
import com.microhustle.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private com.microhustle.repository.TaskRepository taskRepository;
    @Autowired
    private com.microhustle.repository.UserRepository userRepository;

    // DTO for notification with names
    public static class NotificationDTO {
        public Long id;
        public Long taskId;
        public String taskTitle;
        public Long hustlerId;
        public String hustlerUsername;
        public boolean read;
        public java.time.LocalDateTime createdAt;
        public NotificationDTO(Notification n, String taskTitle, String hustlerUsername) {
            this.id = n.getId();
            this.taskId = n.getTaskId();
            this.taskTitle = taskTitle;
            this.hustlerId = n.getHustlerId();
            this.hustlerUsername = hustlerUsername;
            this.read = n.isRead();
            this.createdAt = n.getCreatedAt();
        }
    }

    @GetMapping("/poster/{posterId}")
    public List<NotificationDTO> getNotifications(@PathVariable Long posterId, @RequestParam(required = false) Boolean unread) {
        List<Notification> notifications = Boolean.TRUE.equals(unread) ?
            notificationRepository.findByPosterIdAndReadFalseOrderByCreatedAtDesc(posterId) :
            notificationRepository.findByPosterIdOrderByCreatedAtDesc(posterId);
        List<NotificationDTO> dtos = new java.util.ArrayList<>();
        for (Notification n : notifications) {
            String taskTitle = null, hustlerUsername = null;
            if (n.getTaskId() != null) {
                com.microhustle.model.Task t = taskRepository.findById(n.getTaskId()).orElse(null);
                if (t != null) taskTitle = t.getTitle();
            }
            if (n.getHustlerId() != null) {
                com.microhustle.model.User u = userRepository.findById(n.getHustlerId()).orElse(null);
                if (u != null) hustlerUsername = u.getUsername();
            }
            dtos.add(new NotificationDTO(n, taskTitle, hustlerUsername));
        }
        return dtos;
    }

    @PostMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Long id) {
        Notification n = notificationRepository.findById(id).orElse(null);
        if (n != null) {
            n.setRead(true);
            notificationRepository.save(n);
        }
        return n;
    }
}

