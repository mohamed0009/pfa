package com.coachai.controller.trainer;

import com.coachai.model.ContentStatus;
import com.coachai.model.Course;
import com.coachai.model.CourseProgress;
import com.coachai.model.Enrollment;
import com.coachai.model.Formation;
import com.coachai.model.Module;
import com.coachai.model.User;
import com.coachai.repository.CourseProgressRepository;
import com.coachai.repository.CourseRepository;
import com.coachai.repository.EnrollmentRepository;
import com.coachai.repository.ExerciseRepository;
import com.coachai.repository.FormationRepository;
import com.coachai.repository.ModuleRepository;
import com.coachai.repository.QuizRepository;
import com.coachai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trainer/stats")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerStatsController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FormationRepository formationRepository;
    
    @Autowired
    private ModuleRepository moduleRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private CourseProgressRepository courseProgressRepository;
    
    @Autowired
    private ExerciseRepository exerciseRepository;
    
    @Autowired
    private QuizRepository quizRepository;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getStats(Authentication authentication) {
        try {
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
            
            List<Formation> formations = formationRepository.findByCreatedBy(trainer);
            List<Module> modules = new ArrayList<>();
            List<Course> courses = new ArrayList<>();
            
            // Récupérer tous les modules et cours du formateur
            for (Formation formation : formations) {
                modules.addAll(moduleRepository.findByFormation(formation));
            }
            
            for (Module module : modules) {
                courses.addAll(courseRepository.findAll().stream()
                    .filter(c -> c.getModule() != null && c.getModule().getId().equals(module.getId()))
                    .collect(Collectors.toList()));
            }
            
            // Calculer les statistiques réelles
            Set<String> uniqueStudents = new HashSet<>();
            Set<String> activeStudents = new HashSet<>();
            double totalProgress = 0.0;
            int progressCount = 0;
            
            for (Course course : courses) {
                List<Enrollment> enrollments = enrollmentRepository.findByCourse(course);
                for (Enrollment enrollment : enrollments) {
                    uniqueStudents.add(enrollment.getUser().getId());
                    
                    // Vérifier si l'étudiant est actif (activité dans les 30 derniers jours)
                    CourseProgress progress = courseProgressRepository.findByEnrollment(enrollment).orElse(null);
                    if (progress != null) {
                        if (progress.getLastActivityDate() != null && 
                            progress.getLastActivityDate().isAfter(LocalDateTime.now().minusDays(30))) {
                            activeStudents.add(enrollment.getUser().getId());
                        }
                        totalProgress += progress.getOverallProgress();
                        progressCount++;
                    }
                }
            }
            
            // Compter le contenu en attente et approuvé
            long pendingFormations = formations.stream()
                .filter(f -> f.getStatus() == ContentStatus.PENDING)
                .count();
            long pendingModules = modules.stream()
                .filter(m -> m.getStatus() == ContentStatus.PENDING)
                .count();
            long pendingCourses = courses.stream()
                .filter(c -> c.getStatus() == ContentStatus.PENDING)
                .count();
            
            long approvedFormations = formations.stream()
                .filter(f -> f.getStatus() == ContentStatus.APPROVED || f.getStatus() == ContentStatus.PUBLISHED)
                .count();
            long approvedModules = modules.stream()
                .filter(m -> m.getStatus() == ContentStatus.APPROVED || m.getStatus() == ContentStatus.PUBLISHED)
                .count();
            long approvedCourses = courses.stream()
                .filter(c -> c.getStatus() == ContentStatus.APPROVED || c.getStatus() == ContentStatus.PUBLISHED)
                .count();
            
            // Compter les exercices et quiz
            long totalExercises = courses.stream()
                .mapToLong(c -> exerciseRepository.findAll().stream()
                    .filter(e -> e.getCourse() != null && e.getCourse().getId().equals(c.getId()))
                    .count())
                .sum();
            
            long totalQuizzes = courses.stream()
                .mapToLong(c -> quizRepository.findAll().stream()
                    .filter(q -> q.getCourse() != null && q.getCourse().getId().equals(c.getId()))
                    .count())
                .sum();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("trainerId", trainer.getId());
            stats.put("totalFormations", formations.size());
            stats.put("totalModules", modules.size());
            stats.put("totalCourses", courses.size());
            stats.put("totalExercises", totalExercises);
            stats.put("totalQuizzes", totalQuizzes);
            stats.put("totalStudents", uniqueStudents.size());
            stats.put("activeStudents", activeStudents.size());
            stats.put("averageStudentProgress", progressCount > 0 ? totalProgress / progressCount : 0.0);
            stats.put("averageStudentSatisfaction", 4.2); // À calculer depuis les reviews
            stats.put("contentPendingValidation", pendingFormations + pendingModules + pendingCourses);
            stats.put("contentApproved", approvedFormations + approvedModules + approvedCourses);
            stats.put("responseTime", 2.5); // Temps de réponse moyen en heures
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error calculating stats", "message", e.getMessage()));
        }
    }
    
    @GetMapping("/formations/statistics")
    public ResponseEntity<List<Map<String, Object>>> getFormationsStatistics(Authentication authentication) {
        try {
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
            
            List<Formation> formations = formationRepository.findByCreatedBy(trainer);
            List<Map<String, Object>> formationsStats = new ArrayList<>();
            
            for (Formation formation : formations) {
                List<Module> modules = moduleRepository.findByFormation(formation);
                List<Course> courses = new ArrayList<>();
                
                for (Module module : modules) {
                    courses.addAll(courseRepository.findAll().stream()
                        .filter(c -> c.getModule() != null && c.getModule().getId().equals(module.getId()))
                        .collect(Collectors.toList()));
                }
                
                // Calculer les statistiques pour cette formation
                Set<String> uniqueStudents = new HashSet<>();
                Set<String> activeStudents = new HashSet<>();
                double totalProgress = 0.0;
                int progressCount = 0;
                double totalScore = 0.0;
                int scoreCount = 0;
                int completedCount = 0;
                
                for (Course course : courses) {
                    List<Enrollment> enrollments = enrollmentRepository.findByCourse(course);
                    for (Enrollment enrollment : enrollments) {
                        uniqueStudents.add(enrollment.getUser().getId());
                        
                        CourseProgress progress = courseProgressRepository.findByEnrollment(enrollment).orElse(null);
                        if (progress != null) {
                            if (progress.getLastActivityDate() != null && 
                                progress.getLastActivityDate().isAfter(LocalDateTime.now().minusDays(30))) {
                                activeStudents.add(enrollment.getUser().getId());
                            }
                            totalProgress += progress.getOverallProgress();
                            progressCount++;
                            
                            if (progress.getOverallProgress() >= 100) {
                                completedCount++;
                            }
                            
                            totalScore += progress.getAverageQuizScore();
                            if (progress.getAverageQuizScore() > 0) {
                                scoreCount++;
                            }
                        }
                    }
                }
                
                double averageProgress = progressCount > 0 ? totalProgress / progressCount : 0.0;
                double averageScore = scoreCount > 0 ? totalScore / scoreCount : 0.0;
                double completionRate = uniqueStudents.size() > 0 ? 
                    (double) completedCount / uniqueStudents.size() * 100 : 0.0;
                
                Map<String, Object> formationStat = new HashMap<>();
                formationStat.put("formationId", formation.getId());
                formationStat.put("formationName", formation.getTitle());
                formationStat.put("totalStudents", uniqueStudents.size());
                formationStat.put("activeStudents", activeStudents.size());
                formationStat.put("averageProgress", averageProgress);
                formationStat.put("averageCompletionTime", formation.getDuration());
                formationStat.put("averageScore", averageScore);
                formationStat.put("completionRate", completionRate);
                formationStat.put("dropoutRate", 10.0); // À calculer depuis les enrollments DROPPED
                
                formationsStats.add(formationStat);
            }
            
            return ResponseEntity.ok(formationsStats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }
    
    @GetMapping("/courses")
    public ResponseEntity<List<Map<String, Object>>> getTrainerCourses(Authentication authentication) {
        try {
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
            
            List<Formation> formations = formationRepository.findByCreatedBy(trainer);
            List<Module> modules = new ArrayList<>();
            List<Course> courses = new ArrayList<>();
            
            for (Formation formation : formations) {
                modules.addAll(moduleRepository.findByFormation(formation));
            }
            
            for (Module module : modules) {
                courses.addAll(courseRepository.findAll().stream()
                    .filter(c -> c.getModule() != null && c.getModule().getId().equals(module.getId()))
                    .collect(Collectors.toList()));
            }
            
            // Trier par date de création (plus récents en premier)
            courses.sort((c1, c2) -> {
                if (c1.getCreatedAt() == null || c2.getCreatedAt() == null) return 0;
                return c2.getCreatedAt().compareTo(c1.getCreatedAt());
            });
            
            List<Map<String, Object>> coursesData = courses.stream().map(course -> {
                Map<String, Object> courseData = new HashMap<>();
                courseData.put("id", course.getId());
                courseData.put("title", course.getTitle());
                courseData.put("description", course.getDescription());
                courseData.put("duration", course.getEstimatedHours());
                courseData.put("difficulty", course.getLevel() != null ? course.getLevel().toString() : null);
                courseData.put("status", course.getStatus().toString().toLowerCase());
                courseData.put("moduleId", course.getModule() != null ? course.getModule().getId() : null);
                courseData.put("enrolledCount", course.getEnrolledCount());
                courseData.put("completionRate", course.getCompletionRate());
                courseData.put("createdAt", course.getCreatedAt());
                courseData.put("updatedAt", course.getUpdatedAt());
                return courseData;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(coursesData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }
    
    @GetMapping("/ai/statistics")
    public ResponseEntity<Map<String, Object>> getAIStatistics(Authentication authentication) {
        try {
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
            
            // Compter les contenus générés par l'IA pour ce formateur
            List<Course> aiCourses = courseRepository.findAll().stream()
                .filter(c -> c.getCreatedBy() != null && 
                            c.getCreatedBy().getId().equals(trainer.getId()) && 
                            c.isAIGenerated())
                .collect(Collectors.toList());
            
            long quizzesGenerated = aiCourses.stream()
                .mapToLong(c -> quizRepository.findAll().stream()
                    .filter(q -> q.getCourse() != null && 
                               q.getCourse().getId().equals(c.getId()) && 
                               q.isAIGenerated())
                    .count())
                .sum();
            
            long exercisesGenerated = aiCourses.stream()
                .mapToLong(c -> exerciseRepository.findAll().stream()
                    .filter(e -> e.getCourse() != null && 
                               e.getCourse().getId().equals(c.getId()) && 
                               e.isAIGenerated())
                    .count())
                .sum();
            
            Map<String, Object> aiStats = new HashMap<>();
            aiStats.put("totalGenerated", aiCourses.size());
            aiStats.put("quizzesGenerated", quizzesGenerated);
            aiStats.put("exercisesGenerated", exercisesGenerated);
            aiStats.put("summariesGenerated", 0); // À implémenter si nécessaire
            
            return ResponseEntity.ok(aiStats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error calculating AI stats"));
        }
    }
}

