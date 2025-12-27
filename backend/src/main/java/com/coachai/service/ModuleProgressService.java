package com.coachai.service;

import com.coachai.model.FormationEnrollment;
import com.coachai.model.FormationProgress;
import com.coachai.model.Module;
import com.coachai.model.ModuleProgress;
import com.coachai.model.Quiz;
import com.coachai.model.QuizQuestion;
import com.coachai.model.Formation;
import com.coachai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service pour gérer la progression des modules dans une formation
 */
@Service
public class ModuleProgressService {

    @Autowired
    private ModuleProgressRepository moduleProgressRepository;

    @Autowired
    private FormationEnrollmentRepository enrollmentRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private FormationProgressRepository formationProgressRepository;

    /**
     * Marque le texte d'un module comme complété
     */
    @Transactional
    public ModuleProgress markTextCompleted(String enrollmentId, String moduleId) {
        FormationEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));
        
        com.coachai.model.Module module = moduleRepository.findById(moduleId)
            .orElseThrow(() -> new IllegalArgumentException("Module not found"));

        ModuleProgress progress = getOrCreateModuleProgress(enrollment, module);
        progress.setTextCompleted(true);
        progress.setTextCompletedAt(LocalDateTime.now());
        
        ModuleProgress saved = moduleProgressRepository.save(progress);
        updateFormationProgress(enrollment);
        
        return saved;
    }

    /**
     * Marque la vidéo d'un module comme complétée
     */
    @Transactional
    public ModuleProgress markVideoCompleted(String enrollmentId, String moduleId) {
        FormationEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));
        
        com.coachai.model.Module module = moduleRepository.findById(moduleId)
            .orElseThrow(() -> new IllegalArgumentException("Module not found"));

        ModuleProgress progress = getOrCreateModuleProgress(enrollment, module);
        progress.setVideoCompleted(true);
        progress.setVideoCompletedAt(LocalDateTime.now());
        
        ModuleProgress saved = moduleProgressRepository.save(progress);
        updateFormationProgress(enrollment);
        
        return saved;
    }

    /**
     * Marque le lab/TP d'un module comme complété
     */
    @Transactional
    public ModuleProgress markLabCompleted(String enrollmentId, String moduleId) {
        FormationEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));
        
        com.coachai.model.Module module = moduleRepository.findById(moduleId)
            .orElseThrow(() -> new IllegalArgumentException("Module not found"));

        ModuleProgress progress = getOrCreateModuleProgress(enrollment, module);
        progress.setLabCompleted(true);
        progress.setLabCompletedAt(LocalDateTime.now());
        
        ModuleProgress saved = moduleProgressRepository.save(progress);
        updateFormationProgress(enrollment);
        
        return saved;
    }

    /**
     * Soumet le quiz d'un module et valide le module si réussi
     */
    @Transactional
    public ModuleProgress submitModuleQuiz(String enrollmentId, String moduleId, 
                                           java.util.Map<String, Object> answers) {
        FormationEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));
        
        com.coachai.model.Module module = moduleRepository.findById(moduleId)
            .orElseThrow(() -> new IllegalArgumentException("Module not found"));

        if (module.getQuiz() == null) {
            throw new IllegalArgumentException("Module does not have a quiz");
        }

        ModuleProgress progress = getOrCreateModuleProgress(enrollment, module);
        
        // Calculer le score du quiz
        Quiz quiz = module.getQuiz();
        double score = calculateQuizScore(quiz, answers);
        progress.setQuizScore(score);
        progress.setQuizCompleted(true);
        progress.setQuizCompletedAt(LocalDateTime.now());
        
        // Valider le module si le quiz est réussi
        if (score >= quiz.getPassingScore()) {
            progress.setModuleValidated(true);
            progress.setCompletedAt(LocalDateTime.now());
            
            // Débloquer le module suivant
            unlockNextModule(enrollment, module);
        }
        
        ModuleProgress saved = moduleProgressRepository.save(progress);
        updateFormationProgress(enrollment);
        
        return saved;
    }

    /**
     * Récupère ou crée la progression d'un module
     */
    private ModuleProgress getOrCreateModuleProgress(FormationEnrollment enrollment, com.coachai.model.Module module) {
        Optional<ModuleProgress> existing = moduleProgressRepository.findByEnrollmentAndModule(enrollment, module);
        
        if (existing.isPresent()) {
            return existing.get();
        }
        
        ModuleProgress progress = new ModuleProgress();
        progress.setEnrollment(enrollment);
        progress.setModule(module);
        progress.setTextCompleted(false);
        progress.setVideoCompleted(false);
        progress.setLabCompleted(false);
        progress.setQuizCompleted(false);
        progress.setModuleValidated(false);
        
        return moduleProgressRepository.save(progress);
    }

    /**
     * Calcule le score d'un quiz
     */
    private double calculateQuizScore(Quiz quiz, java.util.Map<String, Object> answers) {
        if (quiz.getQuestions() == null || quiz.getQuestions().isEmpty()) {
            return 0.0;
        }
        
        int totalPoints = 0;
        int earnedPoints = 0;
        
        for (QuizQuestion question : quiz.getQuestions()) {
            totalPoints += question.getPoints();
            
            Object userAnswer = answers.get(question.getId());
            if (userAnswer != null && isAnswerCorrect(question, userAnswer)) {
                earnedPoints += question.getPoints();
            }
        }
        
        return totalPoints > 0 ? (earnedPoints * 100.0 / totalPoints) : 0.0;
    }

    /**
     * Vérifie si une réponse est correcte
     */
    private boolean isAnswerCorrect(QuizQuestion question, Object userAnswer) {
        if (question.getType() == QuizQuestion.QuestionType.MULTIPLE_CHOICE) {
            // Pour MCQ, comparer l'index ou la valeur
            if (userAnswer instanceof Number) {
                return question.getCorrectAnswer().equals(((Number) userAnswer).intValue());
            }
            return question.getCorrectAnswer().toString().equals(userAnswer.toString());
        } else if (question.getType() == QuizQuestion.QuestionType.TRUE_FALSE) {
            return question.getCorrectAnswer().toString().equalsIgnoreCase(userAnswer.toString());
        } else {
            // Pour questions ouvertes, comparaison simple
            return question.getCorrectAnswer().toString().equalsIgnoreCase(userAnswer.toString());
        }
    }

    /**
     * Débloque le module suivant après validation du module actuel
     */
    private void unlockNextModule(FormationEnrollment enrollment, com.coachai.model.Module currentModule) {
        Formation formation = enrollment.getFormation();
        List<com.coachai.model.Module> modules = moduleRepository.findByFormationOrderByOrderAsc(formation);
        
        int currentIndex = -1;
        for (int i = 0; i < modules.size(); i++) {
            if (modules.get(i).getId().equals(currentModule.getId())) {
                currentIndex = i;
                break;
            }
        }
        
        // Débloquer le module suivant
        if (currentIndex >= 0 && currentIndex < modules.size() - 1) {
            com.coachai.model.Module nextModule = modules.get(currentIndex + 1);
            nextModule.setLocked(false);
            moduleRepository.save(nextModule);
        }
    }

    /**
     * Met à jour la progression globale de la formation
     */
    private void updateFormationProgress(FormationEnrollment enrollment) {
        FormationProgress formationProgress = enrollment.getProgress();
        if (formationProgress == null) {
            formationProgress = new FormationProgress();
            formationProgress.setEnrollment(enrollment);
            enrollment.setProgress(formationProgress);
        }
        
        List<ModuleProgress> moduleProgresses = moduleProgressRepository.findByEnrollment(enrollment);
        Formation formation = enrollment.getFormation();
        List<com.coachai.model.Module> modules = moduleRepository.findByFormationOrderByOrderAsc(formation);
        
        int totalModules = modules.size();
        int completedModules = 0;
        int completedQuizzes = 0;
        double totalQuizScore = 0.0;
        int quizCount = 0;
        
        for (ModuleProgress mp : moduleProgresses) {
            if (mp.isModuleValidated()) {
                completedModules++;
            }
            if (mp.isQuizCompleted() && mp.getQuizScore() != null) {
                completedQuizzes++;
                totalQuizScore += mp.getQuizScore();
                quizCount++;
            }
        }
        
        formationProgress.setTotalModules(totalModules);
        formationProgress.setCompletedModules(completedModules);
        formationProgress.setTotalQuizzes(totalModules); // Un quiz par module
        formationProgress.setCompletedQuizzes(completedQuizzes);
        formationProgress.setAverageQuizScore(quizCount > 0 ? totalQuizScore / quizCount : 0.0);
        
        // Calculer progression globale
        double overallProgress = totalModules > 0 ? (completedModules * 100.0 / totalModules) : 0.0;
        formationProgress.setOverallProgress(overallProgress);
        formationProgress.setLastActivityDate(LocalDateTime.now());
        
        formationProgressRepository.save(formationProgress);
        
        // Vérifier si la formation est complétée
        if (completedModules == totalModules && totalModules > 0) {
            enrollment.setStatus(FormationEnrollment.EnrollmentStatus.COMPLETED);
            enrollment.setCompletedAt(LocalDateTime.now());
            enrollment.setCertificateEarned(true);
            enrollmentRepository.save(enrollment);
        }
    }

    /**
     * Récupère la progression d'un module pour un étudiant
     */
    public ModuleProgress getModuleProgress(String enrollmentId, String moduleId) {
        FormationEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));
        
        Module module = moduleRepository.findById(moduleId)
            .orElseThrow(() -> new IllegalArgumentException("Module not found"));
        
        return moduleProgressRepository.findByEnrollmentAndModule(enrollment, module)
            .orElseGet(() -> {
                // Créer une progression vide si elle n'existe pas
                ModuleProgress progress = new ModuleProgress();
                progress.setEnrollment(enrollment);
                progress.setModule(module);
                return progress;
            });
    }

    /**
     * Récupère toutes les progressions de modules pour une inscription
     */
    public List<ModuleProgress> getModuleProgresses(String enrollmentId) {
        FormationEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));
        
        return moduleProgressRepository.findByEnrollmentOrderByModuleOrderAsc(enrollment);
    }
}

