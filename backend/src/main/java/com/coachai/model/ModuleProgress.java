package com.coachai.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "module_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModuleProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "progress_id", nullable = false)
    private CourseProgress progress;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;
    
    @Column(nullable = false)
    private double progressPercentage = 0.0; // 0-100
    
    private int completedLessons = 0;
    
    private int totalLessons = 0;
    
    private boolean isCompleted = false;
    
    private LocalDateTime completedAt;
}


