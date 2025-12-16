package com.coachai.controller.user;

import com.coachai.model.Course;
import com.coachai.model.ContentStatus;
import com.coachai.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:4200")
public class CourseController {
    @Autowired
    private CourseRepository courseRepository;
    
    @GetMapping
    public ResponseEntity<?> getAllCourses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) Boolean popular) {
        try {
            List<Course> courses = List.of();
            
            if (popular != null && popular) {
                try {
                    courses = courseRepository.findPopularCourses(ContentStatus.PUBLISHED);
                } catch (Exception e) {
                    // Fallback to all published courses
                    courses = courseRepository.findByStatus(ContentStatus.PUBLISHED);
                }
            } else if (category != null && !category.isEmpty()) {
                try {
                    courses = courseRepository.findByCategory(category);
                } catch (Exception e) {
                    // Return empty list if category filter fails
                    courses = List.of();
                }
            } else if (level != null && !level.isEmpty()) {
                try {
                    Course.Level levelEnum = Course.Level.valueOf(level.toUpperCase());
                    courses = courseRepository.findByLevel(levelEnum);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid level parameter", "validLevels", new String[]{"DEBUTANT", "INTERMEDIAIRE", "AVANCE"}));
                } catch (Exception e) {
                    courses = List.of();
                }
            } else {
                try {
                    courses = courseRepository.findByStatus(ContentStatus.PUBLISHED);
                } catch (Exception e) {
                    courses = List.of();
                }
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
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable String id) {
        try {
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course ID is required"));
            }
            
            Course course = courseRepository.findById(id).orElse(null);
            if (course == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Course not found", "id", id));
            }
            return ResponseEntity.ok(course);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching course", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

