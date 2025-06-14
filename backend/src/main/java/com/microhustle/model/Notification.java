package com.microhustle.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long posterId;
    private Long taskId;
    private Long hustlerId;
    private boolean read = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Notification() {}
    public Notification(Long posterId, Long taskId, Long hustlerId) {
        this.posterId = posterId;
        this.taskId = taskId;
        this.hustlerId = hustlerId;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public Long getPosterId() { return posterId; }
    public void setPosterId(Long posterId) { this.posterId = posterId; }
    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }
    public Long getHustlerId() { return hustlerId; }
    public void setHustlerId(Long hustlerId) { this.hustlerId = hustlerId; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
