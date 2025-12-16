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
@Table(name = "exercises")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Exercise {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String instructions;
    
    @Enumerated(EnumType.STRING)
    private DifficultyLevel difficulty;
    
    private int estimatedTime; // en minutes
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExerciseType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private com.coachai.model.ContentStatus status = com.coachai.model.ContentStatus.DRAFT;
    
    @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExerciseSubmission> submissions = new ArrayList<>();
    
    private boolean isAIGenerated = false;
    
    @Column(columnDefinition = "TEXT")
    private String aiGenerationPrompt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "enrollments", "conversations", "preferences", "password"})
    private User createdBy;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    public enum ExerciseType {
        PRATIQUE, SIMULATION, PROJET, CODE
    }
    
    public enum DifficultyLevel {
        FACILE, MOYEN, DIFFICILE
    }
}

