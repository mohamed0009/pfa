package com.coachai.service;

import com.coachai.dto.CourseProgressDetailDto;
import com.coachai.dto.LessonProgressDto;
import com.coachai.dto.ModuleProgressResponseDto;
import com.coachai.model.Course;
import com.coachai.model.CourseProgress;
import com.coachai.model.Enrollment;
import com.coachai.model.Formation;
import com.coachai.model.Lesson;
import com.coachai.model.QuizAttempt;
import com.coachai.model.User;
import com.coachai.repository.CourseProgressRepository;
import com.coachai.repository.EnrollmentRepository;
import com.coachai.repository.LessonRepository;
import com.coachai.repository.ModuleRepository;
import com.coachai.repository.QuizAttemptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProgressService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CourseProgressRepository courseProgressRepository;

    // Note: ModuleProgress tracking will be added later when needed

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Transactional
    public ModuleProgressResponseDto markLessonCompleted(LessonProgressDto dto) {
        Enrollment enrollment = enrollmentRepository.findById(dto.getEnrollmentId())
            .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        Lesson lesson = lessonRepository.findById(dto.getLessonId())
            .orElseThrow(() -> new RuntimeException("Lesson not found"));

        // Obtenir ou créer le CourseProgress
        CourseProgress courseProgress = courseProgressRepository.findByEnrollment(enrollment)
            .orElseGet(() -> {
                CourseProgress cp = new CourseProgress();
                cp.setEnrollment(enrollment);
                cp.setOverallProgress(0.0);
                cp.setCompletedLessons(0);
                cp.setTotalLessons(getTotalLessonsForCourse(enrollment.getCourse()));
                cp.setCompletedModules(0);
                cp.setTotalModules(getTotalModulesForCourse(enrollment.getCourse()));
                cp.setLastActivityDate(LocalDateTime.now());
                return courseProgressRepository.save(cp);
            });

        // Marquer la leçon comme complétée
        lesson.setCompleted(true);
        lessonRepository.save(lesson);

        // Mettre à jour la progression du cours
        courseProgress.setCompletedLessons(courseProgress.getCompletedLessons() + 1);
        courseProgress.setLastActivityDate(LocalDateTime.now());
        
        // Calculer la progression globale
        double progress = (double) courseProgress.getCompletedLessons() / courseProgress.getTotalLessons() * 100;
        courseProgress.setOverallProgress(progress);
        courseProgressRepository.save(courseProgress);

        // Obtenir le module de la leçon
        com.coachai.model.Module module = lesson.getCourse().getModule();
        if (module != null) {
            return updateModuleProgress(courseProgress, module);
        }

        return new ModuleProgressResponseDto();
    }

    private ModuleProgressResponseDto updateModuleProgress(CourseProgress courseProgress, com.coachai.model.Module module) {
        // Compter les leçons complétées du cours
        List<Lesson> moduleLessons = lessonRepository.findByCourseOrderByOrderAsc(
            courseProgress.getEnrollment().getCourse()
        );
        long completedCount = moduleLessons.stream().filter(Lesson::isCompleted).count();
        int totalLessons = moduleLessons.size();

        double moduleProgressPercentage = totalLessons > 0 ? (double) completedCount / totalLessons * 100 : 0;

        // Vérifier si le module est terminé
        boolean isModuleCompleted = completedCount >= totalLessons;
        if (isModuleCompleted && courseProgress.getCompletedModules() < courseProgress.getTotalModules()) {
            courseProgress.setCompletedModules(courseProgress.getCompletedModules() + 1);
            courseProgressRepository.save(courseProgress);
        }

        // Construire la réponse
        ModuleProgressResponseDto response = new ModuleProgressResponseDto();
        response.setModuleId(module.getId());
        response.setModuleName(module.getTitle());
        response.setProgressPercentage((int) moduleProgressPercentage);
        response.setCompletedLessons((int) completedCount);
        response.setTotalLessons(totalLessons);
        response.setCompleted(isModuleCompleted);
        response.setNextModuleUnlocked(isModuleCompleted);

        // Trouver la prochaine leçon
        Optional<Lesson> nextLesson = getNextLesson(moduleLessons, completedCount);
        nextLesson.ifPresent(lesson -> response.setNextLessonId(lesson.getId()));

        // Liste des IDs de leçons complétées
        List<String> completedIds = moduleLessons.stream()
            .filter(Lesson::isCompleted)
            .map(Lesson::getId)
            .collect(Collectors.toList());
        response.setCompletedLessonIds(completedIds);

        return response;
    }

    public CourseProgressDetailDto getCourseProgress(String enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        CourseProgress courseProgress = courseProgressRepository.findByEnrollment(enrollment)
            .orElseGet(() -> {
                CourseProgress cp = new CourseProgress();
                cp.setEnrollment(enrollment);
                cp.setOverallProgress(0.0);
                cp.setCompletedLessons(0);
                cp.setTotalLessons(getTotalLessonsForCourse(enrollment.getCourse()));
                cp.setCompletedModules(0);
                cp.setTotalModules(getTotalModulesForCourse(enrollment.getCourse()));
                return courseProgressRepository.save(cp);
            });

        CourseProgressDetailDto dto = new CourseProgressDetailDto();
        dto.setEnrollmentId(enrollmentId);
        dto.setCourseId(enrollment.getCourse().getId());
        dto.setCourseTitle(enrollment.getCourse().getTitle());
        dto.setOverallProgress((int) courseProgress.getOverallProgress());
        dto.setCompletedModules(courseProgress.getCompletedModules());
        dto.setTotalModules(courseProgress.getTotalModules());
        dto.setCompletedLessons(courseProgress.getCompletedLessons());
        dto.setTotalLessons(courseProgress.getTotalLessons());

        // Calculer score moyen des quiz
        List<QuizAttempt> attempts = quizAttemptRepository.findByUser(enrollment.getUser());
        double avgScore = attempts.stream()
            .mapToDouble(QuizAttempt::getScore)
            .average()
            .orElse(0.0);
        dto.setAverageScore(avgScore);

        // Trouver le prochain module/leçon
        // TODO: implémenter la logique de next module/lesson

        return dto;
    }

    private int getTotalLessonsForCourse(Course course) {
        return lessonRepository.findByCourse(course).size();
    }

    private int getTotalLessonsForModule(com.coachai.model.Module module) {
        // Dans la nouvelle architecture, les modules contiennent directement le contenu
        // (textContent, videoUrl, labContent, quiz) et n'ont plus de cours
        // Pour l'instant, on retourne 0 car les modules n'ont plus de leçons
        // TODO: adapter cette méthode selon la nouvelle structure de contenu
        return 0;
    }

    private int getTotalModulesForCourse(Course course) {
        if (course.getModule() != null && course.getModule().getFormation() != null) {
            return moduleRepository.findByFormation(course.getModule().getFormation()).size();
        }
        return 1;
    }

    private Optional<Lesson> getNextLesson(List<Lesson> lessons, long completedCount) {
        return lessons.stream()
            .filter(l -> !l.isCompleted())
            .findFirst();
    }
}

