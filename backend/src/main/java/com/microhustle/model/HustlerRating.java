package com.microhustle.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
public class HustlerRating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User hustler;

    @ManyToOne(optional = false)
    private User poster;

    @ManyToOne(optional = false)
    private Task task;

    private int rating; // 1 to 5
    private String comment;
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getHustler() { return hustler; }
    public void setHustler(User hustler) { this.hustler = hustler; }

    public User getPoster() { return poster; }
    public void setPoster(User poster) { this.poster = poster; }

    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
