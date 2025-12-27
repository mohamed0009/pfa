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
 * Progression d'un apprenant sur une leçon
 * Une vidéo est considérée comme terminée si ≥ 80% visionnée
 */
@Entity
@Table(name = "lesson_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class LessonProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private FormationEnrollment enrollment;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;
    
    @Column(nullable = false)
    private double watchPercentage = 0.0; // 0-100
    
    @Column(nullable = false)
    private boolean isCompleted = false; // true si watchPercentage >= 80
    
    private LocalDateTime startedAt;
    
    private LocalDateTime completedAt;
    
    @LastModifiedDate
    private LocalDateTime lastWatchedAt;
    
    private double timeSpent = 0.0; // en minutes
    
    /**
     * Met à jour le pourcentage visionné et vérifie si la leçon est terminée
     */
    public void updateWatchPercentage(double percentage) {
        this.watchPercentage = Math.min(100.0, Math.max(0.0, percentage));
        this.isCompleted = this.watchPercentage >= 80.0;
        if (this.isCompleted && this.completedAt == null) {
            this.completedAt = LocalDateTime.now();
        }
    }
}


