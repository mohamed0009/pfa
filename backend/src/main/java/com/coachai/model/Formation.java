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
@Table(name = "formations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Formation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String thumbnail;
    
    @Enumerated(EnumType.STRING)
    private Level level;
    
    private String category;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private com.coachai.model.ContentStatus status = com.coachai.model.ContentStatus.DRAFT;
    
    private double duration; // en heures
    
    @OneToMany(mappedBy = "formation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("order ASC")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Module> modules = new ArrayList<>();
    
    private int enrolledCount = 0;
    
    private double completionRate = 0.0;
    
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
    
    public enum Level {
        DEBUTANT, INTERMEDIAIRE, AVANCE
    }
    
    public enum ContentStatus {
        DRAFT, PENDING, APPROVED, PUBLISHED, REJECTED, ARCHIVED
    }
}

