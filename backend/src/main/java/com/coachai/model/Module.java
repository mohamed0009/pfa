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
@Table(name = "modules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Module {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "formation_id", nullable = false)
    private Formation formation;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "module_order", nullable = false)
    private int order;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private com.coachai.model.ContentStatus status = com.coachai.model.ContentStatus.DRAFT;
    
    // Contenu du module (remplace les cours)
    @Column(columnDefinition = "TEXT")
    private String textContent; // Contenu texte/lecture
    
    @Column(columnDefinition = "TEXT")
    private String videoUrl; // URL de la vidéo
    
    @Column(columnDefinition = "TEXT")
    private String labContent; // Contenu du lab/TP
    
    // Quiz associé au module (relation bidirectionnelle)
    @OneToOne(mappedBy = "module", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "module", "questions", "attempts", "course"})
    private Quiz quiz;
    
    // Le module est verrouillé jusqu'à ce que le précédent soit validé
    @Column(nullable = false)
    private boolean isLocked = false;
    
    private double duration; // en heures
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "enrollments", "conversations", "preferences", "password"})
    private User createdBy;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    private LocalDateTime submittedForValidationAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "validated_by")
    private User validatedBy;
    
    private LocalDateTime validatedAt;
    
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;
}

