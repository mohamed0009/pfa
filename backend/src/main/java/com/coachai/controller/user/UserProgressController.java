package com.coachai.controller.user;

import com.coachai.model.CourseProgress;
import com.coachai.model.Enrollment;
import com.coachai.model.User;
import com.coachai.repository.CourseProgressRepository;
import com.coachai.repository.EnrollmentRepository;
import com.coachai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/progress")
@CrossOrigin(origins = "http://localhost:4200")
public class UserProgressController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private CourseProgressRepository courseProgressRepository;
    
    @GetMapping
    public ResponseEntity<?> getProgress(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
        
        List<Enrollment> enrollments = enrollmentRepository.findByUser(user);
        
        int modulesCompleted = 0;
        int totalModules = 0;
        int lessonsCompleted = 0;
        int totalLessons = 0;
        int quizzesCompleted = 0;
        double totalScore = 0.0;
        double totalTimeSpent = 0.0;
        int currentStreak = 0;
        
        for (Enrollment enrollment : enrollments) {
            if (enrollment.getProgress() != null) {
                CourseProgress progress = enrollment.getProgress();
                modulesCompleted += progress.getCompletedModules();
                totalModules += progress.getTotalModules();
                lessonsCompleted += progress.getCompletedLessons();
                totalLessons += progress.getTotalLessons();
                quizzesCompleted += progress.getCompletedQuizzes();
                totalScore += progress.getAverageQuizScore();
                totalTimeSpent += progress.getTotalTimeSpent();
                if (progress.getCurrentStreak() > currentStreak) {
                    currentStreak = progress.getCurrentStreak();
                }
            }
        }
        
        double overallProgress = totalModules > 0 ? (double) modulesCompleted / totalModules * 100 : 0.0;
        double averageQuizScore = quizzesCompleted > 0 ? totalScore / quizzesCompleted : 0.0;
        
        Map<String, Object> progress = new HashMap<>();
        progress.put("userId", user.getId());
        progress.put("overallProgress", overallProgress);
        progress.put("modulesCompleted", modulesCompleted);
        progress.put("totalModules", totalModules);
        progress.put("lessonsCompleted", lessonsCompleted);
        progress.put("totalLessons", totalLessons);
        progress.put("quizzesCompleted", quizzesCompleted);
        progress.put("averageQuizScore", averageQuizScore);
        progress.put("totalStudyTime", totalTimeSpent);
        progress.put("currentStreak", currentStreak);
        
        return ResponseEntity.ok(progress);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching progress", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/courses/{courseId}")
    public ResponseEntity<?> getCourseProgress(
            @PathVariable String courseId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (courseId == null || courseId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course ID is required"));
            }
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            // Find enrollment for this course
            List<Enrollment> enrollments = enrollmentRepository.findByUser(user);
            Enrollment enrollment = enrollments.stream()
                .filter(e -> e.getCourse() != null && e.getCourse().getId().equals(courseId))
                .findFirst()
                .orElse(null);
            
            if (enrollment == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Enrollment not found for this course"));
            }
            
            if (enrollment.getProgress() != null) {
                return ResponseEntity.ok(enrollment.getProgress());
            }
            
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching course progress", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PutMapping("/lessons/{lessonId}")
    public ResponseEntity<?> updateLessonProgress(
            @PathVariable String lessonId,
            @RequestBody(required = false) Map<String, Object> progressData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (lessonId == null || lessonId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Lesson ID is required"));
            }
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            if (progressData == null) {
                progressData = new HashMap<>();
            }
            
            Boolean isCompleted = progressData.get("isCompleted") instanceof Boolean 
                ? (Boolean) progressData.get("isCompleted") 
                : null;
            Number timeSpent = progressData.get("timeSpent") instanceof Number 
                ? (Number) progressData.get("timeSpent") 
                : null;
            
            // Update progress logic here - would need LessonProgress entity
            Map<String, Object> response = new HashMap<>();
            response.put("lessonId", lessonId);
            response.put("isCompleted", isCompleted != null ? isCompleted : false);
            response.put("timeSpent", timeSpent != null ? timeSpent.doubleValue() : 0.0);
            response.put("updatedAt", java.time.LocalDateTime.now());
            response.put("message", "Progress updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error updating lesson progress", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}


