package com.coachai.service;

import com.coachai.model.*;
import com.coachai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Service de validation des formations selon les règles métier type Coursera
 */
@Service
public class FormationValidationService {
    
    @Autowired
    private FormationRepository formationRepository;
    
    @Autowired
    private ModuleRepository moduleRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private LessonRepository lessonRepository;
    
    @Autowired
    private QuizRepository quizRepository;
    
    /**
     * Vérifie si une formation peut être publiée
     * NOUVELLE STRUCTURE:
     * - Au moins 1 module
     * - Chaque module doit contenir:
     *   - Texte (textContent)
     *   - Vidéo (videoUrl)
     *   - Lab/TP (labContent)
     *   - Quiz
     */
    @Transactional(readOnly = true)
    public ValidationResult validateForPublication(String formationId) {
        Formation formation = formationRepository.findById(formationId)
            .orElseThrow(() -> new IllegalArgumentException("Formation not found"));
        
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        
        // Vérifier qu'il y a au moins 1 module
        List<com.coachai.model.Module> modules = moduleRepository.findByFormationOrderByOrderAsc(formation);
        if (modules == null || modules.isEmpty()) {
            errors.add("Une formation doit contenir au moins 1 module");
            return new ValidationResult(false, errors, warnings);
        }
        
        // Vérifier chaque module
        for (com.coachai.model.Module module : modules) {
            // Vérifier le contenu texte
            if (module.getTextContent() == null || module.getTextContent().trim().isEmpty()) {
                errors.add(String.format("Le module '%s' doit contenir un contenu texte", module.getTitle()));
            }
            
            // Vérifier la vidéo
            if (module.getVideoUrl() == null || module.getVideoUrl().trim().isEmpty()) {
                errors.add(String.format("Le module '%s' doit contenir une vidéo", module.getTitle()));
            }
            
            // Vérifier le lab/TP
            if (module.getLabContent() == null || module.getLabContent().trim().isEmpty()) {
                errors.add(String.format("Le module '%s' doit contenir un lab/TP", module.getTitle()));
            }
            
            // Vérifier le quiz
            if (module.getQuiz() == null) {
                errors.add(String.format("Le module '%s' doit contenir un quiz", module.getTitle()));
            } else {
                // Vérifier que le quiz a au moins une question
                if (module.getQuiz().getQuestions() == null || module.getQuiz().getQuestions().isEmpty()) {
                    errors.add(String.format("Le quiz du module '%s' doit contenir au moins une question", module.getTitle()));
                }
            }
        }
        
        // Vérifier qu'un formateur est assigné
        if (formation.getAssignedTo() == null) {
            warnings.add("Aucun formateur n'est assigné à cette formation");
        }
        
        boolean isValid = errors.isEmpty();
        return new ValidationResult(isValid, errors, warnings);
    }
    
    /**
     * Vérifie si une formation peut être modifiée
     * Une formation publiée ne peut pas être modifiée directement
     */
    public boolean canBeModified(Formation formation) {
        return formation.getStatus() != ContentStatus.PUBLISHED;
    }
    
    /**
     * Vérifie si une formation peut être supprimée
     * Une formation suivie par des apprenants ne peut pas être supprimée
     */
    public boolean canBeDeleted(Formation formation) {
        return formation.getEnrolledCount() == 0;
    }
    
    public static class ValidationResult {
        private final boolean valid;
        private final List<String> errors;
        private final List<String> warnings;
        
        public ValidationResult(boolean valid, List<String> errors, List<String> warnings) {
            this.valid = valid;
            this.errors = errors;
            this.warnings = warnings;
        }
        
        public boolean isValid() {
            return valid;
        }
        
        public List<String> getErrors() {
            return errors;
        }
        
        public List<String> getWarnings() {
            return warnings;
        }
    }
}


