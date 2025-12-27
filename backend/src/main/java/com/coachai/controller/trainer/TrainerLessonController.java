package com.coachai.controller.trainer;

import com.coachai.model.Lesson;
import com.coachai.model.User;
import com.coachai.model.Course;
import com.coachai.repository.LessonRepository;
import com.coachai.repository.UserRepository;
import com.coachai.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trainer/lessons")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerLessonController {
    @Autowired
    private LessonRepository lessonRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @GetMapping
    public ResponseEntity<?> getLessons(
            @RequestParam(required = false) String courseId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            List<Lesson> lessons;
            if (courseId != null) {
                Course course = courseRepository.findById(courseId).orElse(null);
                if (course != null) {
                    lessons = lessonRepository.findByCourse(course);
                } else {
                    lessons = List.of();
                }
            } else {
                lessons = lessonRepository.findAll();
            }
            return ResponseEntity.ok(lessons);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching lessons", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createLesson(
            @RequestBody Map<String, Object> lessonData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
            
            Lesson lesson = new Lesson();
            lesson.setCreatedBy(trainer);
            
            if (lessonData.containsKey("courseId")) {
                String courseId = (String) lessonData.get("courseId");
                Course course = courseRepository.findById(courseId).orElse(null);
                if (course == null) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Course not found"));
                }
                lesson.setCourse(course);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "courseId is required"));
            }
            
            if (lessonData.containsKey("title")) {
                lesson.setTitle((String) lessonData.get("title"));
            }
            if (lessonData.containsKey("description")) {
                lesson.setDescription((String) lessonData.get("description"));
            }
            if (lessonData.containsKey("type")) {
                try {
                    lesson.setType(Lesson.LessonType.valueOf(((String) lessonData.get("type")).toUpperCase()));
                } catch (Exception e) {
                    lesson.setType(Lesson.LessonType.VIDEO);
                }
            } else {
                lesson.setType(Lesson.LessonType.VIDEO);
            }
            if (lessonData.containsKey("videoUrl")) {
                lesson.setVideoUrl((String) lessonData.get("videoUrl"));
            }
            if (lessonData.containsKey("contentUrl")) {
                lesson.setContentUrl((String) lessonData.get("contentUrl"));
            }
            if (lessonData.containsKey("transcript")) {
                lesson.setTranscript((String) lessonData.get("transcript"));
            }
            if (lessonData.containsKey("duration")) {
                lesson.setDuration(((Number) lessonData.get("duration")).intValue());
            }
            if (lessonData.containsKey("order")) {
                lesson.setOrder(((Number) lessonData.get("order")).intValue());
            } else {
                // Définir l'ordre automatiquement
                List<Lesson> existingLessons = lessonRepository.findByCourse(lesson.getCourse());
                lesson.setOrder(existingLessons.size() + 1);
            }
            if (lessonData.containsKey("lessonNumber")) {
                lesson.setLessonNumber(((Number) lessonData.get("lessonNumber")).intValue());
            } else {
                lesson.setLessonNumber(lesson.getOrder());
            }
            
            Lesson saved = lessonRepository.save(lesson);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error creating lesson", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateLesson(
            @PathVariable String id,
            @RequestBody Map<String, Object> updateData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            return lessonRepository.findById(id)
                .map(lesson -> {
                    if (updateData.containsKey("title")) {
                        lesson.setTitle((String) updateData.get("title"));
                    }
                    if (updateData.containsKey("description")) {
                        lesson.setDescription((String) updateData.get("description"));
                    }
                    if (updateData.containsKey("type")) {
                        try {
                            lesson.setType(Lesson.LessonType.valueOf(((String) updateData.get("type")).toUpperCase()));
                        } catch (Exception e) {
                            // Invalid type, skip
                        }
                    }
                    if (updateData.containsKey("videoUrl")) {
                        lesson.setVideoUrl((String) updateData.get("videoUrl"));
                    }
                    if (updateData.containsKey("contentUrl")) {
                        lesson.setContentUrl((String) updateData.get("contentUrl"));
                    }
                    if (updateData.containsKey("transcript")) {
                        lesson.setTranscript((String) updateData.get("transcript"));
                    }
                    if (updateData.containsKey("duration")) {
                        lesson.setDuration(((Number) updateData.get("duration")).intValue());
                    }
                    if (updateData.containsKey("order")) {
                        lesson.setOrder(((Number) updateData.get("order")).intValue());
                    }
                    
                    Lesson saved = lessonRepository.save(lesson);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error updating lesson", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLesson(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (!lessonRepository.existsById(id)) {
                return ResponseEntity.status(404).body(Map.of("error", "Lesson not found"));
            }
            
            lessonRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error deleting lesson", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

