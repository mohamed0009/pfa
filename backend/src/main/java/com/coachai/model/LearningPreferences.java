package com.coachai.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "learning_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearningPreferences {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Enumerated(EnumType.STRING)
    private LearningPace learningPace = LearningPace.MODERE;
    
    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "preferred_content_types", joinColumns = @JoinColumn(name = "preferences_id"))
    @Column(name = "content_type")
    private List<ContentType> preferredContentTypes = new ArrayList<>();
    
    @Enumerated(EnumType.STRING)
    private StudyTimePreference studyTimePreference = StudyTimePreference.APRES_MIDI;
    
    private boolean notificationsEnabled = true;
    
    private int weeklyGoalHours = 10;
    
    public enum LearningPace {
        LENT, MODERE, RAPIDE
    }
    
    public enum ContentType {
        VIDEO, LECTURE, EXERCICE_PRATIQUE, QUIZ, SIMULATION
    }
    
    public enum StudyTimePreference {
        MATIN, APRES_MIDI, SOIR, NUIT
    }
}


