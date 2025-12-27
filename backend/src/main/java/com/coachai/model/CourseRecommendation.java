package com.coachai.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "course_recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class CourseRecommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "enrollments", "conversations", "preferences", "password"})
    private User student;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "module", "lessons", "exercises", "quizzes", "resources"})
    private Course course;
    
    @Column(columnDefinition = "TEXT")
    private String reason; // Raison de la recommandation basée sur les conversations
    
    @Column(columnDefinition = "TEXT")
    private String conversationExcerpt; // Extrait de conversation pertinente
    
    private double confidenceScore; // Score de confiance (0-100)
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecommendationStatus status = RecommendationStatus.PENDING;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "enrollments", "conversations", "preferences", "password"})
    private User reviewedBy;
    
    private LocalDateTime reviewedAt;
    
    @Column(columnDefinition = "TEXT")
    private String reviewNotes; // Notes du formateur lors de l'acceptation/rejet
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    public enum RecommendationStatus {
        PENDING,    // En attente de validation
        ACCEPTED,   // Acceptée par le formateur
        REJECTED    // Rejetée par le formateur
    }
}

