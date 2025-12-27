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
@RequestMapping("/api/user/search")
@CrossOrigin(origins = "http://localhost:4200")
public class UserSearchController {
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private ModuleRepository moduleRepository;
    
    @Autowired
    private LessonRepository lessonRepository;
    
    @Autowired
    private QuizRepository quizRepository;
    
    @Autowired
    private ConversationRepository conversationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<?> search(
            @RequestParam String query,
            @RequestParam(required = false) List<String> type,
            @RequestParam(required = false) List<String> niveau,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.ok(List.of());
            }
            
            String searchQuery = query.toLowerCase().trim();
            List<Map<String, Object>> results = new ArrayList<>();
            
            // Search courses
            if (type == null || type.contains("course") || type.contains("module")) {
                List<Course> courses = courseRepository.findAll();
                for (Course course : courses) {
                    if ((course.getTitle() != null && course.getTitle().toLowerCase().contains(searchQuery)) ||
                        (course.getDescription() != null && course.getDescription().toLowerCase().contains(searchQuery))) {
                        results.add(Map.of(
                            "id", course.getId(),
                            "type", "course",
                            "title", course.getTitle() != null ? course.getTitle() : "",
                            "description", course.getDescription() != null ? course.getDescription() : "",
                            "url", "/user/courses/" + course.getId(),
                            "relevance", 90,
                            "category", "Cours",
                            "metadata", Map.of(
                                "niveau", "Moyen",
                                "duration", course.getDuration() != null ? course.getDuration() + "h" : "0h"
                            )
                        ));
                    }
                }
                
                // Search modules
                List<Module> modules = moduleRepository.findAll();
                for (Module module : modules) {
                    if ((module.getTitle() != null && module.getTitle().toLowerCase().contains(searchQuery)) ||
                        (module.getDescription() != null && module.getDescription().toLowerCase().contains(searchQuery))) {
                        results.add(Map.of(
                            "id", module.getId(),
                            "type", "module",
                            "title", module.getTitle() != null ? module.getTitle() : "",
                            "description", module.getDescription() != null ? module.getDescription() : "",
                            "url", "/user/learning-path/module/" + module.getId(),
                            "relevance", 85,
                            "category", "Module",
                    "metadata", Map.of(
                        "niveau", module.getFormation() != null && module.getFormation().getLevel() != null ? 
                                 module.getFormation().getLevel().toString() : "Moyen",
                        "duration", module.getDuration() + "h"
                    )
                        ));
                    }
                }
            }
            
            // Search lessons
            if (type == null || type.contains("lesson")) {
                List<Lesson> lessons = lessonRepository.findAll();
                for (Lesson lesson : lessons) {
                    if ((lesson.getTitle() != null && lesson.getTitle().toLowerCase().contains(searchQuery)) ||
                        (lesson.getDescription() != null && lesson.getDescription().toLowerCase().contains(searchQuery))) {
                        results.add(Map.of(
                            "id", lesson.getId(),
                            "type", "lesson",
                            "title", lesson.getTitle() != null ? lesson.getTitle() : "",
                            "description", lesson.getDescription() != null ? lesson.getDescription() : "",
                            "url", "/user/lessons/" + lesson.getId(),
                            "relevance", 80,
                            "category", "Leçon",
                            "metadata", Map.of(
                                "moduleTitle", lesson.getCourse() != null && lesson.getCourse().getModule() != null ?
                                              lesson.getCourse().getModule().getTitle() : ""
                            )
                        ));
                    }
                }
            }
            
            // Search quizzes
            if (type == null || type.contains("quiz")) {
                List<Quiz> quizzes = quizRepository.findAll();
                for (Quiz quiz : quizzes) {
                    if ((quiz.getTitle() != null && quiz.getTitle().toLowerCase().contains(searchQuery)) ||
                        (quiz.getDescription() != null && quiz.getDescription().toLowerCase().contains(searchQuery))) {
                        results.add(Map.of(
                            "id", quiz.getId(),
                            "type", "quiz",
                            "title", quiz.getTitle() != null ? quiz.getTitle() : "",
                            "description", quiz.getDescription() != null ? quiz.getDescription() : "",
                            "url", "/user/quiz/" + quiz.getId(),
                            "relevance", 75,
                            "category", "Quiz",
                            "metadata", Map.of(
                                "difficulty", quiz.getDifficulty() != null ? quiz.getDifficulty().toString() : "Moyen",
                                "questionsCount", quiz.getQuestions() != null ? quiz.getQuestions().size() : 0
                            )
                        ));
                    }
                }
            }
            
            // Filter by niveau if provided
            if (niveau != null && !niveau.isEmpty()) {
                results = results.stream()
                    .filter(r -> {
                        Map<String, Object> metadata = (Map<String, Object>) r.get("metadata");
                        String resultNiveau = metadata != null ? (String) metadata.get("niveau") : null;
                        return resultNiveau != null && niveau.contains(resultNiveau);
                    })
                    .collect(Collectors.toList());
            }
            
            // Sort by relevance
            results.sort((a, b) -> Integer.compare((Integer) b.get("relevance"), (Integer) a.get("relevance")));
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error performing search", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

