package com.microhustle.model;

import javax.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.Set;

@Entity
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
    private String tags;
    private Integer budget;
    private LocalDate deadline;
    private String status;

    @ManyToOne
    @com.fasterxml.jackson.annotation.JsonBackReference
    private User poster;

    @ManyToMany
    @JoinTable(
        name = "task_accepted_hustlers",
        joinColumns = @JoinColumn(name = "task_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"password"})
    private java.util.Set<User> acceptedHustlers = new java.util.HashSet<>();

    public Task() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public Integer getBudget() { return budget; }
    public void setBudget(Integer budget) { this.budget = budget; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public User getPoster() { return poster; }
    public void setPoster(User poster) { this.poster = poster; }
    public java.util.Set<User> getAcceptedHustlers() { return acceptedHustlers; }
    public void setAcceptedHustlers(java.util.Set<User> acceptedHustlers) { this.acceptedHustlers = acceptedHustlers; }
}
