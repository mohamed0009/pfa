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
 * Suivi de la progression d'un étudiant dans un module spécifique
 */
@Entity
@Table(name = "module_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ModuleProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user", "formation", "progress"})
    private FormationEnrollment enrollment;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "module_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "formation", "quiz"})
    private Module module;
    
    // Progression des éléments du module
    @Column(nullable = false)
    private boolean textCompleted = false;
    
    @Column(nullable = false)
    private boolean videoCompleted = false;
    
    @Column(nullable = false)
    private boolean labCompleted = false;
    
    @Column(nullable = false)
    private boolean quizCompleted = false;
    
    // Score du quiz
    private Double quizScore;
    
    // Le module est validé si le quiz est réussi
    @Column(nullable = false)
    private boolean isModuleValidated = false;
    
    private LocalDateTime textCompletedAt;
    private LocalDateTime videoCompletedAt;
    private LocalDateTime labCompletedAt;
    private LocalDateTime quizCompletedAt;
    
    private LocalDateTime completedAt;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    /**
     * Vérifie si tous les éléments du module sont complétés
     */
    public boolean isFullyCompleted() {
        return textCompleted && videoCompleted && labCompleted && quizCompleted;
    }
    
    /**
     * Calcule le pourcentage de progression
     */
    public double getProgressPercentage() {
        int completed = 0;
        int total = 4;
        
        if (textCompleted) completed++;
        if (videoCompleted) completed++;
        if (labCompleted) completed++;
        if (quizCompleted) completed++;
        
        return (completed * 100.0) / total;
    }
}
