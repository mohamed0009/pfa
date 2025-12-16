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
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String title;
    
    private String subtitle;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String longDescription;
    
    private String instructorName;
    
    private String instructorTitle;
    
    private String instructorAvatar;
    
    private String thumbnailUrl;
    
    private String previewVideoUrl;
    
    private String category;
    
    @Enumerated(EnumType.STRING)
    private Level level;
    
    private String language = "Français";
    
    private String duration; // ex: "6 semaines"
    
    private double estimatedHours;
    
    private double rating = 0.0;
    
    private int reviewsCount = 0;
    
    private int enrolledCount = 0;
    
    private double price = 0.0;
    
    @ElementCollection
    @CollectionTable(name = "course_skills", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "skill")
    private List<String> skills = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "course_objectives", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "objective")
    private List<String> learningObjectives = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "course_prerequisites", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "prerequisite")
    private List<String> prerequisites = new ArrayList<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "formation", "courses", "createdBy"})
    private Module module;
    
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("order ASC")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Lesson> lessons = new ArrayList<>();
    
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<CourseResource> resources = new ArrayList<>();
    
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Exercise> exercises = new ArrayList<>();
    
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Quiz> quizzes = new ArrayList<>();
    
    @Column(name = "course_order", nullable = false)
    private int order;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private com.coachai.model.ContentStatus status = com.coachai.model.ContentStatus.DRAFT;
    
    private int enrolledStudents = 0;
    
    private double completionRate = 0.0;
    
    private boolean isPopular = false;
    
    private boolean isCertified = false;
    
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
    
    private boolean isAIGenerated = false;
    
    @Column(columnDefinition = "TEXT")
    private String aiGenerationPrompt;
    
    public enum Level {
        DEBUTANT, INTERMEDIAIRE, AVANCE
    }
}

