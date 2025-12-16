package com.coachai.controller.user;

import com.coachai.model.Course;
import com.coachai.model.CourseProgress;
import com.coachai.model.Enrollment;
import com.coachai.model.User;
import com.coachai.repository.CourseRepository;
import com.coachai.repository.CourseProgressRepository;
import com.coachai.repository.EnrollmentRepository;
import com.coachai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/enrollments")
@CrossOrigin(origins = "http://localhost:4200")
public class UserEnrollmentController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private CourseProgressRepository courseProgressRepository;
    
    @GetMapping
    public ResponseEntity<?> getEnrollments(Authentication authentication) {
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
            if (enrollments == null) {
                enrollments = List.of();
            }
            
            return ResponseEntity.ok(enrollments);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching enrollments", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping("/{courseId}")
    public ResponseEntity<?> enrollInCourse(
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
            
            Course course = courseRepository.findById(courseId)
                .orElse(null);
            
            if (course == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Course not found", "courseId", courseId));
            }
            
            if (enrollmentRepository.existsByUserAndCourse(user, course)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Already enrolled in this course"));
            }
            
            Enrollment enrollment = new Enrollment();
            enrollment.setUser(user);
            enrollment.setCourse(course);
            enrollment.setStatus(Enrollment.EnrollmentStatus.ACTIVE);
            enrollment.setEnrolledAt(LocalDateTime.now());
            enrollment.setStartedAt(LocalDateTime.now());
            
            // Create progress
            CourseProgress progress = new CourseProgress();
            progress.setEnrollment(enrollment);
            progress.setTotalLessons(course.getLessons() != null ? course.getLessons().size() : 0);
            progress.setTotalModules(1);
            progress.setTotalQuizzes(course.getQuizzes() != null ? course.getQuizzes().size() : 0);
            
            enrollment.setProgress(progress);
            
            Enrollment saved = enrollmentRepository.save(enrollment);
            courseProgressRepository.save(progress);
            
            // Update course enrollment count
            course.setEnrolledCount(course.getEnrolledCount() + 1);
            courseRepository.save(course);
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error enrolling in course", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}


