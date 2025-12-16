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
@Table(name = "lessons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @Column(nullable = false)
    private int lessonNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LessonType type;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private int duration; // en minutes
    
    private String videoUrl;
    
    private String contentUrl; // Pour type 'lecture' (PDF, article)
    
    @Column(columnDefinition = "TEXT")
    private String transcript; // Transcription vidéo
    
    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LessonResource> resources = new ArrayList<>();
    
    private boolean isCompleted = false;
    
    private boolean isMandatory = true;
    
    @Column(name = "lesson_order", nullable = false)
    private int order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    public enum LessonType {
        VIDEO, LECTURE, QUIZ, EXERCISE, AI_CHAT
    }
}


