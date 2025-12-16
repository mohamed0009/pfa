package com.coachai.controller.trainer;

import com.coachai.model.Course;
import com.coachai.model.User;
import com.coachai.repository.CourseRepository;
import com.coachai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trainer/courses")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerCourseController {
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<?> getCourses(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            List<Course> courses = courseRepository.findAll();
            if (courses == null) {
                courses = List.of();
            }
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching courses", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createCourse(
            @RequestBody(required = false) Map<String, Object> courseData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (courseData == null || courseData.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Request body is required"));
            }
            
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email).orElse(null);
            
            if (trainer == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Trainer not found"));
            }
            
            Course course = new Course();
            course.setCreatedBy(trainer);
            course.setStatus(com.coachai.model.ContentStatus.DRAFT);
            
            if (courseData.containsKey("title")) {
                course.setTitle((String) courseData.get("title"));
            }
            if (courseData.containsKey("description")) {
                course.setDescription((String) courseData.get("description"));
            }
            if (courseData.containsKey("level")) {
                try {
                    course.setLevel(Course.Level.valueOf(((String) courseData.get("level")).toUpperCase()));
                } catch (Exception e) {
                    // Invalid level, skip
                }
            }
            if (courseData.containsKey("category")) {
                course.setCategory((String) courseData.get("category"));
            }
            
            Course saved = courseRepository.save(course);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error creating course", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> updateData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course ID is required"));
            }
            
            if (updateData == null || updateData.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Request body is required"));
            }
            
            Course course = courseRepository.findById(id).orElse(null);
            if (course == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Course not found"));
            }
            
            if (updateData.containsKey("title")) {
                course.setTitle((String) updateData.get("title"));
            }
            if (updateData.containsKey("description")) {
                course.setDescription((String) updateData.get("description"));
            }
            
            Course saved = courseRepository.save(course);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error updating course", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course ID is required"));
            }
            
            if (!courseRepository.existsById(id)) {
                return ResponseEntity.status(404).body(Map.of("error", "Course not found"));
            }
            
            courseRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error deleting course", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}


