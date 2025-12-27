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

/**
 * Progression d'un apprenant dans une formation
 */
@Entity
@Table(name = "formation_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class FormationProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @OneToOne
    @JoinColumn(name = "enrollment_id", nullable = false, unique = true)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user", "formation", "progress"})
    private FormationEnrollment enrollment;
    
    @Column(nullable = false)
    private double overallProgress = 0.0; // 0-100
    
    private int completedModules = 0;
    
    private int totalModules = 0;
    
    private int completedCourses = 0;
    
    private int totalCourses = 0;
    
    private int completedLessons = 0;
    
    private int totalLessons = 0;
    
    private int completedQuizzes = 0;
    
    private int totalQuizzes = 0;
    
    private double averageQuizScore = 0.0;
    
    private double totalTimeSpent = 0.0; // en heures
    
    private int currentStreak = 0; // jours consécutifs
    
    @LastModifiedDate
    private LocalDateTime lastActivityDate;
    
    @OneToMany(mappedBy = "formationProgress", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<FormationModuleProgress> moduleProgresses = new ArrayList<>();
    
    /**
     * Indique si tous les modules sont validés (pour certificat)
     */
    public boolean isAllModulesValidated() {
        return totalModules > 0 && completedModules == totalModules;
    }
}


