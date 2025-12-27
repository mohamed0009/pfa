package com.coachai.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Inscription d'un apprenant à une formation
 */
@Entity
@Table(name = "formation_enrollments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class FormationEnrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "enrollments", "conversations", "preferences", "password"})
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "formation_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "modules", "createdBy"})
    private Formation formation;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnrollmentStatus status = EnrollmentStatus.EN_COURS;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime enrolledAt;
    
    private LocalDateTime startedAt;
    
    private LocalDateTime completedAt;
    
    private LocalDateTime targetCompletionDate;
    
    @OneToOne(cascade = CascadeType.ALL, mappedBy = "enrollment")
    private FormationProgress progress;
    
    // Progression par module (nouveau système)
    @OneToMany(mappedBy = "enrollment", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<com.coachai.model.ModuleProgress> moduleProgresses = new java.util.ArrayList<>();
    
    private boolean certificateEarned = false;
    
    private String certificateUrl;
    
    public enum EnrollmentStatus {
        EN_COURS, COMPLETED, DROPPED
    }
}


