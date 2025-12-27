package com.coachai.controller.trainer;

import com.coachai.model.Course;
import com.coachai.model.User;
import com.coachai.model.Module;
import com.coachai.repository.CourseRepository;
import com.coachai.repository.UserRepository;
import com.coachai.repository.ModuleRepository;
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
    
    @Autowired
    private ModuleRepository moduleRepository;
    
    @GetMapping
    public ResponseEntity<?> getCourses(
            @RequestParam(required = false) String moduleId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            List<Course> courses;
            if (moduleId != null) {
                Module module = moduleRepository.findById(moduleId).orElse(null);
                if (module != null) {
                    courses = courseRepository.findByModule(module);
                } else {
                    courses = List.of();
                }
            } else {
                courses = courseRepository.findAll();
            }
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
            // Par défaut, les cours sont PUBLISHED pour être visibles par les apprenants
            course.setStatus(com.coachai.model.ContentStatus.PUBLISHED);
            
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
            if (courseData.containsKey("moduleId")) {
                String moduleId = (String) courseData.get("moduleId");
                Module module = moduleRepository.findById(moduleId).orElse(null);
                if (module != null) {
                    course.setModule(module);
                }
            }
            if (courseData.containsKey("order")) {
                course.setOrder(((Number) courseData.get("order")).intValue());
            }
            if (courseData.containsKey("estimatedHours")) {
                Object hoursObj = courseData.get("estimatedHours");
                if (hoursObj instanceof Number) {
                    course.setEstimatedHours(((Number) hoursObj).doubleValue());
                } else if (hoursObj instanceof String) {
                    try {
                        course.setEstimatedHours(Double.parseDouble((String) hoursObj));
                    } catch (NumberFormatException e) {
                        // Invalid hours, skip
                    }
                }
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
            if (updateData.containsKey("level")) {
                try {
                    course.setLevel(Course.Level.valueOf(((String) updateData.get("level")).toUpperCase()));
                } catch (Exception e) {
                    // Invalid level, skip
                }
            }
            if (updateData.containsKey("category")) {
                course.setCategory((String) updateData.get("category"));
            }
            if (updateData.containsKey("order")) {
                course.setOrder(((Number) updateData.get("order")).intValue());
            }
            if (updateData.containsKey("estimatedHours")) {
                Object hoursObj = updateData.get("estimatedHours");
                if (hoursObj instanceof Number) {
                    course.setEstimatedHours(((Number) hoursObj).doubleValue());
                } else if (hoursObj instanceof String) {
                    try {
                        course.setEstimatedHours(Double.parseDouble((String) hoursObj));
                    } catch (NumberFormatException e) {
                        // Invalid hours, skip
                    }
                }
            }
            if (updateData.containsKey("status")) {
                try {
                    String statusStr = ((String) updateData.get("status")).toUpperCase();
                    course.setStatus(com.coachai.model.ContentStatus.valueOf(statusStr));
                } catch (Exception e) {
                    // Invalid status, skip
                }
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


