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
@Table(name = "ai_recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class AIRecommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecommendationType type; // FORMATION, MODULE, QUIZ, LAB, RESOURCE
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String justification; // Raison basée sur l'analyse IA
    
    @ElementCollection
    @CollectionTable(name = "ai_recommendation_based_on", joinColumns = @JoinColumn(name = "recommendation_id"))
    @Column(name = "data_point")
    private List<String> basedOn = new ArrayList<>(); // Données utilisées pour la recommandation
    
    @ElementCollection
    @CollectionTable(name = "ai_recommendation_target_students", joinColumns = @JoinColumn(name = "recommendation_id"))
    @Column(name = "student_id")
    private List<String> targetStudents = new ArrayList<>(); // IDs des étudiants concernés
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority = Priority.MEDIUM;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecommendationStatus status = RecommendationStatus.PENDING;
    
    // Données basées sur l'analyse
    private Integer studentCount; // Nombre d'étudiants concernés
    private String difficultyDetected; // Difficulté détectée
    private String level; // Niveau prédit par le modèle ML
    private String specialty; // Spécialité
    
    @ElementCollection
    @CollectionTable(name = "ai_recommendation_topics", joinColumns = @JoinColumn(name = "recommendation_id"))
    @Column(name = "topic")
    private List<String> conversationTopics = new ArrayList<>();
    
    @Column(columnDefinition = "TEXT")
    private String suggestedContent; // Contenu suggéré (JSON ou texte)
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "enrollments", "conversations", "preferences", "password"})
    private User approvedBy;
    
    private LocalDateTime approvedAt;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    public enum RecommendationType {
        FORMATION, MODULE, QUIZ, LAB, RESOURCE
    }
    
    public enum Priority {
        LOW, MEDIUM, HIGH
    }
    
    public enum RecommendationStatus {
        PENDING, APPROVED, REJECTED, PUBLISHED
    }
}

