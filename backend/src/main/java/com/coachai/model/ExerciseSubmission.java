package com.coachai.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exercise_submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ExerciseSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "course", "submissions", "createdBy"})
    private Exercise exercise;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "enrollments", "conversations", "preferences", "password"})
    private User user;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @ElementCollection
    @CollectionTable(name = "submission_attachments", joinColumns = @JoinColumn(name = "submission_id"))
    @Column(name = "attachment_url")
    private List<String> attachments = new ArrayList<>();
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status = SubmissionStatus.SUBMITTED;
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
    
    private Double score;
    
    private Double maxScore;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graded_by")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "enrollments", "conversations", "preferences", "password"})
    private User gradedBy;
    
    private LocalDateTime reviewedAt;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt;
    
    public enum SubmissionStatus {
        SUBMITTED, REVIEWED, GRADED, VALIDATED
    }
}


