package com.coachai.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Progression d'un apprenant dans un module d'une formation
 */
@Entity
@Table(name = "formation_module_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormationModuleProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "progress_id", nullable = false)
    private FormationProgress formationProgress;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;
    
    @Column(nullable = false)
    private double progressPercentage = 0.0; // 0-100
    
    private int completedLessons = 0;
    
    private int totalLessons = 0;
    
    private int completedQuizzes = 0;
    
    private int totalQuizzes = 0;
    
    private boolean isCompleted = false;
    
    private boolean isQuizPassed = false; // Quiz réussi avec score ≥ 70%
    
    private LocalDateTime completedAt;
    
    /**
     * Un module est validé seulement si:
     * - Toutes les étapes (leçons) sont terminées
     * - Le quiz est réussi (score ≥ 60%)
     */
    public boolean isModuleValidated() {
        return isCompleted && isQuizPassed;
    }
}


