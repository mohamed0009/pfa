package com.coachai.service;

import com.coachai.model.*;
import com.coachai.model.Module;
import com.coachai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service de gestion de la progression dans les formations
 * Implémente les règles de progression séquentielle type Coursera
 */
@Service
public class FormationProgressService {
    
    @Autowired
    private FormationEnrollmentRepository enrollmentRepository;
    
    @Autowired
    private FormationProgressRepository progressRepository;
    
    @Autowired
    private LessonProgressRepository lessonProgressRepository;
    
    @Autowired
    private FormationModuleProgressRepository moduleProgressRepository;
    
    @Autowired
    private QuizAttemptRepository quizAttemptRepository;
    
    @Autowired
    private ModuleRepository moduleRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private LessonRepository lessonRepository;
    
    @Autowired
    private QuizRepository quizRepository;
    
    /**
     * Vérifie si un module peut être accessible
     * Règle: Un module est débloqué si le module précédent est validé (ou si c'est le premier module)
     */
    public boolean canAccessModule(String enrollmentId, String moduleId) {
        FormationEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));
        
        Module module = moduleRepository.findById(moduleId)
            .orElseThrow(() -> new IllegalArgumentException("Module not found"));
        
        Formation formation = module.getFormation();
        List<Module> modules = moduleRepository.findByFormationOrderByOrderAsc(formation);
        
        int moduleIndex = -1;
        for (int i = 0; i < modules.size(); i++) {
            if (modules.get(i).getId().equals(moduleId)) {
                moduleIndex = i;
                break;
            }
        }
        
        // Le premier module est toujours accessible
        if (moduleIndex == 0) {
            return true;
        }
        
        // Vérifier que le module précédent est validé
        if (moduleIndex > 0) {
            Module previousModule = modules.get(moduleIndex - 1);
            FormationProgress progress = progressRepository.findByEnrollment(enrollment)
                .orElseThrow(() -> new IllegalArgumentException("Formation progress not found"));
            
            FormationModuleProgress previousModuleProgress = moduleProgressRepository
                .findByFormationProgressAndModule(progress, previousModule)
                .orElse(null);
            
            return previousModuleProgress != null && previousModuleProgress.isModuleValidated();
        }
        
        return false;
    }
    
    /**
     * Met à jour la progression d'une vidéo
     * Règle: Une vidéo est considérée comme terminée si ≥ 80% visionnée
     */
    @Transactional
    public void updateLessonProgress(String enrollmentId, String lessonId, double watchPercentage) {
        FormationEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));
        
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));
        
        // Récupérer ou créer la progression de la leçon
        LessonProgress lessonProgress = lessonProgressRepository
            .findByEnrollmentAndLesson(enrollment, lesson)
            .orElse(new LessonProgress());
        
        lessonProgress.setEnrollment(enrollment);
        lessonProgress.setLesson(lesson);
        lessonProgress.updateWatchPercentage(watchPercentage);
        
        if (lessonProgress.getStartedAt() == null) {
            lessonProgress.setStartedAt(LocalDateTime.now());
        }
        lessonProgress.setLastWatchedAt(LocalDateTime.now());
        
        lessonProgressRepository.save(lessonProgress);
        
        // Mettre à jour la progression du module et de la formation
        updateModuleProgressInternal(enrollment, lesson.getCourse().getModule());
        updateFormationProgress(enrollment);
    }
    
    /**
     * Vérifie si une étape peut être débloquée
     * Règles Coursera:
     * 1. Une leçon doit être terminée pour débloquer la suivante
     * 2. Un module doit être validé (contenu + quiz réussi) pour débloquer le suivant
     */
    public boolean canAccessLesson(String enrollmentId, String lessonId) {
        FormationEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));
        
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));
        
        Course course = lesson.getCourse();
        Module module = course.getModule();
        Formation formation = module.getFormation();
        
        // Vérifier que le module précédent est validé (si ce n'est pas le premier module)
        List<Module> modules = moduleRepository.findByFormationOrderByOrderAsc(formation);
        int moduleIndex = -1;
        for (int i = 0; i < modules.size(); i++) {
            if (modules.get(i).getId().equals(module.getId())) {
                moduleIndex = i;
                break;
            }
        }
        
        // Si ce n'est pas le premier module, vérifier que le précédent est validé
        if (moduleIndex > 0) {
            Module previousModule = modules.get(moduleIndex - 1);
            FormationProgress formationProgress = progressRepository.findByEnrollment(enrollment)
                .orElseThrow(() -> new IllegalArgumentException("Formation progress not found"));
            
            FormationModuleProgress previousModuleProgress = moduleProgressRepository
                .findByFormationProgressAndModule(formationProgress, previousModule)
                .orElse(null);
            
            // Le module précédent doit être validé (contenu terminé + quiz réussi)
            if (previousModuleProgress == null || !previousModuleProgress.isModuleValidated()) {
                return false;
            }
        }
        
        // Si c'est la première leçon du cours, elle est accessible
        List<Lesson> lessons = lessonRepository.findByCourseOrderByOrderAsc(course);
        if (lessons.isEmpty() || lessons.get(0).getId().equals(lessonId)) {
            return true;
        }
        
        // Trouver la leçon précédente
        int currentIndex = -1;
        for (int i = 0; i < lessons.size(); i++) {
            if (lessons.get(i).getId().equals(lessonId)) {
                currentIndex = i;
                break;
            }
        }
        
        if (currentIndex <= 0) {
            return true;
        }
        
        Lesson previousLesson = lessons.get(currentIndex - 1);
        
        // Vérifier si la leçon précédente est terminée
        Optional<LessonProgress> previousProgress = lessonProgressRepository
            .findByEnrollmentAndLesson(enrollment, previousLesson);
        
        return previousProgress.isPresent() && previousProgress.get().isCompleted();
    }
    
    /**
     * Valide un module après complétion du contenu et réussite du quiz
     * Règle Coursera: Module validé = toutes les leçons terminées + quiz réussi (≥60%)
     */
    @Transactional
    public boolean validateModule(String enrollmentId, String moduleId) {
        FormationEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));
        
        Module module = moduleRepository.findById(moduleId)
            .orElseThrow(() -> new IllegalArgumentException("Module not found"));
        
        FormationProgress formationProgress = progressRepository.findByEnrollment(enrollment)
            .orElseThrow(() -> new IllegalArgumentException("Formation progress not found"));
        
        FormationModuleProgress moduleProgress = moduleProgressRepository
            .findByFormationProgressAndModule(formationProgress, module)
            .orElse(new FormationModuleProgress());
        
        moduleProgress.setFormationProgress(formationProgress);
        moduleProgress.setModule(module);
        
        // Vérifier que toutes les leçons sont terminées
        List<Course> courses = courseRepository.findByModuleOrderByOrderAsc(module);
        int totalLessons = 0;
        int completedLessons = 0;
        
        for (Course course : courses) {
            List<Lesson> lessons = lessonRepository.findByCourseOrderByOrderAsc(course);
            totalLessons += lessons.size();
            
            for (Lesson lesson : lessons) {
                Optional<LessonProgress> lessonProgress = lessonProgressRepository
                    .findByEnrollmentAndLesson(enrollment, lesson);
                
                if (lessonProgress.isPresent() && lessonProgress.get().isCompleted()) {
                    completedLessons++;
                }
            }
        }
        
        // Vérifier que tous les quiz sont réussi (score ≥ 60% - Règle pédagogique)
        int totalQuizzes = 0;
        int passedQuizzes = 0;
        
        for (Course course : courses) {
            List<Quiz> quizzes = quizRepository.findByCourse(course);
            totalQuizzes += quizzes.size();
            
            for (Quiz quiz : quizzes) {
                List<QuizAttempt> attempts = quizAttemptRepository.findByUserAndQuiz(enrollment.getUser(), quiz);
                boolean quizPassed = attempts.stream()
                    .anyMatch(attempt -> attempt.getScore() >= 60.0 && attempt.isPassed());
                
                if (quizPassed) {
                    passedQuizzes++;
                }
            }
        }
        
        // Le module est validé si toutes les leçons sont terminées ET tous les quiz sont réussi
        boolean allLessonsCompleted = totalLessons > 0 && completedLessons == totalLessons;
        boolean allQuizzesPassed = totalQuizzes == 0 || (totalQuizzes > 0 && passedQuizzes == totalQuizzes);
        boolean isModuleValidated = allLessonsCompleted && allQuizzesPassed;
        
        moduleProgress.setTotalLessons(totalLessons);
        moduleProgress.setCompletedLessons(completedLessons);
        moduleProgress.setTotalQuizzes(totalQuizzes);
        moduleProgress.setCompletedQuizzes(passedQuizzes);
        moduleProgress.setCompleted(allLessonsCompleted);
        moduleProgress.setQuizPassed(allQuizzesPassed);
        
        if (isModuleValidated && moduleProgress.getCompletedAt() == null) {
            moduleProgress.setCompletedAt(LocalDateTime.now());
        }
        
        // Calculer le pourcentage
        if (totalLessons > 0) {
            double progress = (double) completedLessons / totalLessons * 100.0;
            moduleProgress.setProgressPercentage(progress);
        }
        
        moduleProgressRepository.save(moduleProgress);
        
        // Mettre à jour la progression globale
        updateFormationProgress(enrollment);
        
        return isModuleValidated;
    }
    
    /**
     * Met à jour la progression d'un module
     * Un module est validé seulement si:
     * - Toutes les étapes (leçons) sont terminées
     * - Le quiz est réussi (score ≥ 60%)
     */
    @Transactional
    private void updateModuleProgressInternal(FormationEnrollment enrollment, Module module) {
        FormationProgress formationProgress = progressRepository.findByEnrollment(enrollment)
            .orElseThrow(() -> new IllegalArgumentException("Formation progress not found"));
        
        FormationModuleProgress moduleProgress = moduleProgressRepository
            .findByFormationProgressAndModule(formationProgress, module)
            .orElse(new FormationModuleProgress());
        
        moduleProgress.setFormationProgress(formationProgress);
        moduleProgress.setModule(module);
        
        // Compter les leçons complétées
        List<Course> courses = courseRepository.findByModuleOrderByOrderAsc(module);
            int totalLessons = 0;
            int completedLessons = 0;
            
            for (com.coachai.model.Course course : courses) {
            List<Lesson> lessons = lessonRepository.findByCourseOrderByOrderAsc(course);
            totalLessons += lessons.size();
            
            for (Lesson lesson : lessons) {
                Optional<LessonProgress> lessonProgress = lessonProgressRepository
                    .findByEnrollmentAndLesson(enrollment, lesson);
                
                if (lessonProgress.isPresent() && lessonProgress.get().isCompleted()) {
                    completedLessons++;
                }
            }
        }
        
        moduleProgress.setTotalLessons(totalLessons);
        moduleProgress.setCompletedLessons(completedLessons);
        
        // Compter les quiz
        int totalQuizzes = 0;
        int completedQuizzes = 0;
        
        for (Course course : courses) {
            List<Quiz> quizzes = quizRepository.findByCourse(course);
            totalQuizzes += quizzes.size();
            
            for (Quiz quiz : quizzes) {
                // Vérifier si le quiz est réussi (score ≥ 70%)
                List<QuizAttempt> attempts = quizAttemptRepository.findByUserAndQuiz(enrollment.getUser(), quiz);
                boolean quizPassed = attempts.stream()
                    .anyMatch(attempt -> attempt.getScore() >= 60.0 && attempt.isPassed());
                
                if (quizPassed) {
                    completedQuizzes++;
                }
            }
        }
        
        moduleProgress.setTotalQuizzes(totalQuizzes);
        moduleProgress.setCompletedQuizzes(completedQuizzes);
        
        // Le module est complété si toutes les leçons sont terminées
        boolean allLessonsCompleted = totalLessons > 0 && completedLessons == totalLessons;
        moduleProgress.setCompleted(allLessonsCompleted);
        
        // Le module est validé si complété ET quiz réussi
        boolean quizPassed = totalQuizzes > 0 && completedQuizzes == totalQuizzes;
        moduleProgress.setQuizPassed(quizPassed);
        boolean isModuleValidated = allLessonsCompleted && quizPassed;
        
        if (isModuleValidated && moduleProgress.getCompletedAt() == null) {
            moduleProgress.setCompletedAt(LocalDateTime.now());
        }
        
        // Calculer le pourcentage de progression
        if (totalLessons > 0) {
            double progress = (double) completedLessons / totalLessons * 100.0;
            moduleProgress.setProgressPercentage(progress);
        }
        
        moduleProgressRepository.save(moduleProgress);
    }
    
    /**
     * Met à jour la progression globale de la formation
     */
    @Transactional
    public void updateFormationProgress(FormationEnrollment enrollment) {
        FormationProgress progress = progressRepository.findByEnrollment(enrollment)
            .orElseThrow(() -> new IllegalArgumentException("Formation progress not found"));
        
        List<FormationModuleProgress> moduleProgresses = moduleProgressRepository
            .findByFormationProgress(progress);
        
        int completedModules = 0;
        int totalModules = progress.getTotalModules();
        
        for (FormationModuleProgress mp : moduleProgresses) {
            if (mp.isModuleValidated()) {
                completedModules++;
            }
        }
        
        progress.setCompletedModules(completedModules);
        
        // Calculer la progression globale
        if (totalModules > 0) {
            double overallProgress = (double) completedModules / totalModules * 100.0;
            progress.setOverallProgress(overallProgress);
        }
        
        // Mettre à jour les compteurs de leçons et quiz
        int totalLessons = 0;
        int completedLessons = 0;
        int totalQuizzes = 0;
        int completedQuizzes = 0;
        
        for (FormationModuleProgress mp : moduleProgresses) {
            totalLessons += mp.getTotalLessons();
            completedLessons += mp.getCompletedLessons();
            totalQuizzes += mp.getTotalQuizzes();
            completedQuizzes += mp.getCompletedQuizzes();
        }
        
        progress.setTotalLessons(totalLessons);
        progress.setCompletedLessons(completedLessons);
        progress.setTotalQuizzes(totalQuizzes);
        progress.setCompletedQuizzes(completedQuizzes);
        
        progress.setLastActivityDate(LocalDateTime.now());
        
        progressRepository.save(progress);
        
        // Vérifier si tous les modules sont validés pour générer le certificat
        if (progress.isAllModulesValidated() && !enrollment.isCertificateEarned()) {
            // Le certificat sera généré par le service de certificat
            enrollment.setCertificateEarned(true);
            enrollment.setCompletedAt(LocalDateTime.now());
            enrollment.setStatus(FormationEnrollment.EnrollmentStatus.COMPLETED);
            enrollmentRepository.save(enrollment);
        }
    }
}

