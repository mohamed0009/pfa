package com.coachai.controller.admin;

import com.coachai.model.*;
import com.coachai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/courses")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminCoursesController {
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private CourseProgressRepository courseProgressRepository;
    
    @Autowired
    private LessonRepository lessonRepository;
    
    @GetMapping
    public ResponseEntity<?> getAllCourses(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            List<Course> courses = courseRepository.findAll();
            
            // Filter by status
            if (status != null && !status.isEmpty()) {
                try {
                    ContentStatus statusEnum = ContentStatus.valueOf(status.toUpperCase());
                    courses = courses.stream()
                        .filter(c -> c.getStatus() == statusEnum)
                        .collect(Collectors.toList());
                } catch (IllegalArgumentException e) {
                    // Invalid status, ignore filter
                }
            }
            
            // Search filter
            if (search != null && !search.isEmpty()) {
                String searchLower = search.toLowerCase();
                courses = courses.stream()
                    .filter(c -> (c.getTitle() != null && c.getTitle().toLowerCase().contains(searchLower)) ||
                                (c.getDescription() != null && c.getDescription().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
            }
            
            // Map to admin course format
            List<Map<String, Object>> coursesData = new ArrayList<>();
            for (Course course : courses) {
                // Count enrolled students
                long enrolledStudents = enrollmentRepository.findAll().stream()
                    .filter(e -> e.getCourse() != null && e.getCourse().getId().equals(course.getId()))
                    .count();
                
                // Calculate completion rate
                List<Enrollment> courseEnrollments = enrollmentRepository.findAll().stream()
                    .filter(e -> e.getCourse() != null && e.getCourse().getId().equals(course.getId()))
                    .collect(Collectors.toList());
                
                double completionRate = 0.0;
                if (!courseEnrollments.isEmpty()) {
                    long completed = courseEnrollments.stream()
                        .filter(e -> e.getProgress() != null && e.getProgress().getOverallProgress() >= 100.0)
                        .count();
                    completionRate = (double) completed / courseEnrollments.size() * 100;
                }
                
                // Count lessons
                List<Lesson> lessons = lessonRepository.findByCourseOrderByOrderAsc(course);
                
                Map<String, Object> courseData = new HashMap<>();
                courseData.put("id", course.getId());
                courseData.put("moduleId", course.getModule() != null ? course.getModule().getId() : "");
                courseData.put("title", course.getTitle() != null ? course.getTitle() : "");
                courseData.put("description", course.getDescription() != null ? course.getDescription() : "");
                courseData.put("content", course.getLongDescription() != null ? course.getLongDescription() : "");
                Integer courseOrder = course.getOrder();
                courseData.put("order", courseOrder != null ? courseOrder.intValue() : 0);
                courseData.put("status", course.getStatus() != null ? course.getStatus().toString().toLowerCase() : "draft");
                // Convert estimatedHours to minutes for duration
                int durationMinutes = (int) (course.getEstimatedHours() * 60);
                courseData.put("duration", durationMinutes);
                courseData.put("lessons", lessons.size());
                courseData.put("resources", 0);
                courseData.put("enrolledStudents", enrolledStudents);
                courseData.put("completionRate", Math.round(completionRate));
                courseData.put("createdBy", course.getCreatedBy() != null ? course.getCreatedBy().getId() : "");
                courseData.put("createdAt", course.getCreatedAt() != null ? course.getCreatedAt() : new Date());
                courseData.put("validatedBy", "");
                courseData.put("validatedAt", course.getUpdatedAt() != null ? course.getUpdatedAt() : null);
                coursesData.add(courseData);
            }
            
            return ResponseEntity.ok(coursesData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching courses", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(
            @PathVariable String id,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            Course course = courseRepository.findById(id).orElse(null);
            if (course == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Course not found"));
            }
            
            // Count enrolled students
            long enrolledStudents = enrollmentRepository.findAll().stream()
                .filter(e -> e.getCourse() != null && e.getCourse().getId().equals(course.getId()))
                .count();
            
            // Calculate completion rate
            List<Enrollment> courseEnrollments = enrollmentRepository.findAll().stream()
                .filter(e -> e.getCourse() != null && e.getCourse().getId().equals(course.getId()))
                .collect(Collectors.toList());
            
            double completionRate = 0.0;
            if (!courseEnrollments.isEmpty()) {
                long completed = courseEnrollments.stream()
                    .filter(e -> e.getProgress() != null && e.getProgress().getOverallProgress() >= 100.0)
                    .count();
                completionRate = (double) completed / courseEnrollments.size() * 100;
            }
            
            // Get lessons
            List<Lesson> lessons = lessonRepository.findByCourseOrderByOrderAsc(course);
            
            Map<String, Object> courseData = new HashMap<>();
            courseData.put("id", course.getId());
            courseData.put("moduleId", course.getModule() != null ? course.getModule().getId() : "");
            courseData.put("title", course.getTitle() != null ? course.getTitle() : "");
            courseData.put("description", course.getDescription() != null ? course.getDescription() : "");
            courseData.put("content", course.getLongDescription() != null ? course.getLongDescription() : "");
            Integer courseOrder = course.getOrder();
            courseData.put("order", courseOrder != null ? courseOrder.intValue() : 0);
            courseData.put("status", course.getStatus() != null ? course.getStatus().toString().toLowerCase() : "draft");
            // Convert estimatedHours to minutes for duration
            int durationMinutes = (int) (course.getEstimatedHours() * 60);
            courseData.put("duration", durationMinutes);
            courseData.put("lessons", lessons.size());
            courseData.put("resources", 0);
            courseData.put("enrolledStudents", enrolledStudents);
            courseData.put("completionRate", Math.round(completionRate));
            courseData.put("createdBy", course.getCreatedBy() != null ? course.getCreatedBy().getId() : "");
            courseData.put("createdAt", course.getCreatedAt() != null ? course.getCreatedAt() : new Date());
            courseData.put("validatedBy", "");
            courseData.put("validatedAt", course.getUpdatedAt() != null ? course.getUpdatedAt() : null);
            
            return ResponseEntity.ok(courseData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching course", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/{id}/stats")
    public ResponseEntity<?> getCourseStats(
            @PathVariable String id,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            Course course = courseRepository.findById(id).orElse(null);
            if (course == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Course not found"));
            }
            
            long enrolledStudents = enrollmentRepository.findAll().stream()
                .filter(e -> e.getCourse() != null && e.getCourse().getId().equals(course.getId()))
                .count();
            
            List<Enrollment> courseEnrollments = enrollmentRepository.findAll().stream()
                .filter(e -> e.getCourse() != null && e.getCourse().getId().equals(course.getId()))
                .collect(Collectors.toList());
            
            double completionRate = 0.0;
            if (!courseEnrollments.isEmpty()) {
                long completed = courseEnrollments.stream()
                    .filter(e -> e.getProgress() != null && e.getProgress().getOverallProgress() >= 100.0)
                    .count();
                completionRate = (double) completed / courseEnrollments.size() * 100;
            }
            
            List<Lesson> lessons = lessonRepository.findByCourseOrderByOrderAsc(course);
            
            Map<String, Object> stats = Map.of(
                "enrolledStudents", enrolledStudents,
                "completionRate", Math.round(completionRate),
                "totalLessons", lessons.size(),
                "totalResources", 0,
                "status", course.getStatus() != null ? course.getStatus().toString().toLowerCase() : "draft"
            );
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching course stats", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

