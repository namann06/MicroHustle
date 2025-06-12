package com.microhustle.model;

import javax.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String password;
    @Enumerated(EnumType.STRING)
    private Role role;

    public enum Role {
        POSTER, HUSTLER
    }

    public User() {}

    // Tasks this user has posted
    @OneToMany(mappedBy = "poster")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("poster")
    private java.util.Set<Task> postedTasks = new java.util.HashSet<>();

    // Tasks this user has accepted
    @ManyToMany(mappedBy = "acceptedHustlers")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("acceptedHustlers")
    private java.util.Set<Task> acceptedTasks = new java.util.HashSet<>();

    public java.util.Set<Task> getPostedTasks() { return postedTasks; }
    public void setPostedTasks(java.util.Set<Task> postedTasks) { this.postedTasks = postedTasks; }
    public java.util.Set<Task> getAcceptedTasks() { return acceptedTasks; }
    public void setAcceptedTasks(java.util.Set<Task> acceptedTasks) { this.acceptedTasks = acceptedTasks; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
