package com.coachai.controller.user;

import com.coachai.model.*;
import com.coachai.model.Module;
import com.coachai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user/learning-path")
@CrossOrigin(origins = "http://localhost:4200")
public class UserLearningPathController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private FormationRepository formationRepository;
    
    @Autowired
    private ModuleRepository moduleRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private LessonRepository lessonRepository;
    
    @Autowired
    private CourseProgressRepository courseProgressRepository;
    
    @GetMapping
    public ResponseEntity<?> getLearningPath(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            // Get user's enrollments
            List<Enrollment> enrollments = enrollmentRepository.findByUser(user);
            if (enrollments == null || enrollments.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "id", "path1",
                    "userId", user.getId(),
                    "formation", "",
                    "niveau", user.getNiveau() != null ? user.getNiveau().toString() : "Débutant",
                    "startDate", new Date(),
                    "estimatedEndDate", new Date(),
                    "currentStep", 0,
                    "totalSteps", 0,
                    "progressPercentage", 0,
                    "modules", List.of()
                ));
            }
            
            // Get the first active enrollment's formation
            Enrollment firstEnrollment = enrollments.get(0);
            Formation formation = firstEnrollment.getCourse() != null && 
                                  firstEnrollment.getCourse().getModule() != null ?
                                  firstEnrollment.getCourse().getModule().getFormation() : null;
            
            if (formation == null) {
                return ResponseEntity.ok(Map.of(
                    "id", "path1",
                    "userId", user.getId(),
                    "formation", "",
                    "niveau", user.getNiveau() != null ? user.getNiveau().toString() : "Débutant",
                    "startDate", firstEnrollment.getEnrolledAt() != null ? firstEnrollment.getEnrolledAt() : new Date(),
                    "estimatedEndDate", new Date(),
                    "currentStep", 0,
                    "totalSteps", 0,
                    "progressPercentage", 0,
                    "modules", List.of()
                ));
            }
            
            // Get modules for this formation
            List<Module> modules = moduleRepository.findByFormation(formation);
            List<Map<String, Object>> modulesData = new ArrayList<>();
            
            int totalCompletedModules = 0;
            for (Module module : modules) {
                List<Course> courses = courseRepository.findByModule(module);
                List<Map<String, Object>> lessonsData = new ArrayList<>();
                int completedLessons = 0;
                int totalLessons = 0;
                
                for (Course course : courses) {
                    List<Lesson> lessons = lessonRepository.findByCourseOrderByOrderAsc(course);
                    for (Lesson lesson : lessons) {
                        totalLessons++;
                        CourseProgress progress = courseProgressRepository.findByEnrollment(firstEnrollment).orElse(null);
                        boolean isCompleted = progress != null && progress.getCompletedLessons() > 0;
                        if (isCompleted) completedLessons++;
                        
                        int lessonDuration = lesson.getDuration();
                        int lessonOrder = lesson.getLessonNumber();
                        
                        lessonsData.add(Map.of(
                            "id", lesson.getId(),
                            "moduleId", module.getId(),
                            "title", lesson.getTitle() != null ? lesson.getTitle() : "",
                            "description", lesson.getDescription() != null ? lesson.getDescription() : "",
                            "type", lesson.getType() != null ? lesson.getType().toString() : "VIDEO",
                            "duration", lessonDuration,
                            "status", isCompleted ? "completed" : "available",
                            "order", lessonOrder
                        ));
                    }
                }
                
                int moduleProgress = totalLessons > 0 ? (completedLessons * 100 / totalLessons) : 0;
                String moduleStatus = moduleProgress == 100 ? "completed" : 
                                     moduleProgress > 0 ? "in_progress" : "available";
                if (moduleProgress == 100) totalCompletedModules++;
                
                Double moduleDuration = module.getDuration();
                Integer moduleOrder = module.getOrder();
                
                modulesData.add(Map.of(
                    "id", module.getId(),
                    "title", module.getTitle() != null ? module.getTitle() : "",
                    "description", module.getDescription() != null ? module.getDescription() : "",
                    "status", moduleStatus,
                    "progressPercentage", moduleProgress,
                    "estimatedDuration", moduleDuration != null ? moduleDuration : 0.0,
                    "order", moduleOrder != null ? moduleOrder : 0,
                    "lessons", lessonsData
                ));
            }
            
            int overallProgress = modules.size() > 0 ? (totalCompletedModules * 100 / modules.size()) : 0;
            int currentStep = totalCompletedModules + 1;
            
            Map<String, Object> response = Map.of(
                "id", "path1",
                "userId", user.getId(),
                "formation", formation.getTitle() != null ? formation.getTitle() : "",
                "niveau", user.getNiveau() != null ? user.getNiveau().toString() : "Débutant",
                "startDate", firstEnrollment.getEnrolledAt() != null ? firstEnrollment.getEnrolledAt() : new Date(),
                "estimatedEndDate", new Date(),
                "currentStep", currentStep,
                "totalSteps", modules.size(),
                "progressPercentage", overallProgress,
                "modules", modulesData
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching learning path", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            // Return empty recommendations for now
            return ResponseEntity.ok(List.of());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching recommendations", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/next-lesson")
    public ResponseEntity<?> getNextLesson(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            List<Enrollment> enrollments = enrollmentRepository.findByUser(user);
            if (enrollments == null || enrollments.isEmpty()) {
                return ResponseEntity.ok(null);
            }
            
            // Find next incomplete lesson
            for (Enrollment enrollment : enrollments) {
                if (enrollment.getCourse() != null && enrollment.getCourse().getModule() != null) {
                    List<Lesson> lessons = lessonRepository.findByCourseOrderByOrderAsc(enrollment.getCourse());
                    for (Lesson lesson : lessons) {
                        // For now, return first lesson as next lesson
                        // In future, implement actual lesson completion tracking
                        Integer lessonDuration = lesson.getDuration();
                        Integer lessonOrder = lesson.getOrder();
                        return ResponseEntity.ok(Map.of(
                            "id", lesson.getId(),
                            "moduleId", enrollment.getCourse().getModule().getId(),
                            "title", lesson.getTitle() != null ? lesson.getTitle() : "",
                            "description", lesson.getDescription() != null ? lesson.getDescription() : "",
                            "type", lesson.getType() != null ? lesson.getType().toString() : "VIDEO",
                            "duration", lessonDuration != null ? lessonDuration : 0,
                            "status", "available",
                            "order", lessonOrder != null ? lessonOrder : 0
                        ));
                    }
                }
            }
            
            return ResponseEntity.ok(null);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching next lesson", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

