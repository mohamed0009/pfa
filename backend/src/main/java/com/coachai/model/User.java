package com.coachai.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    private String avatarUrl;
    
    private String phone;
    private String bio;
    
    private LocalDateTime validatedAt;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.ACTIVE;
    
    private String formation;
    
    @Enumerated(EnumType.STRING)
    private Level niveau;
    
    // Spécialités du formateur (séparées par des virgules, ex: "Java,React,Python")
    @Column(columnDefinition = "TEXT")
    private String specialties;
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "preferences_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private LearningPreferences preferences;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime joinedAt;
    
    @LastModifiedDate
    private LocalDateTime lastActive;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Enrollment> enrollments = new ArrayList<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Conversation> conversations = new ArrayList<>();
    
    public enum UserRole {
        ADMIN, TRAINER, USER
    }
    
    public enum UserStatus {
        ACTIVE, INACTIVE, PENDING, SUSPENDED
    }
    
    public enum Level {
        DEBUTANT, INTERMEDIAIRE, AVANCE
    }
}


