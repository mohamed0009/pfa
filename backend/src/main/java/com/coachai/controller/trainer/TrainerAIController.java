package com.coachai.controller.trainer;

import com.coachai.model.Course;
import com.coachai.model.Exercise;
import com.coachai.model.Quiz;
import com.coachai.model.User;
import com.coachai.repository.CourseRepository;
import com.coachai.repository.ExerciseRepository;
import com.coachai.repository.QuizRepository;
import com.coachai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/trainer/ai")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerAIController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private ExerciseRepository exerciseRepository;
    
    @Autowired
    private QuizRepository quizRepository;
    
    @PostMapping("/generate")
    public ResponseEntity<?> generateContent(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
            
            String type = (String) request.get("type");
            String prompt = (String) request.get("prompt");
            String difficulty = (String) request.get("difficulty");
            
            // TODO: Integrate with actual AI service (Ollama/FastAPI)
            // For now, return a mock response
            Map<String, Object> generatedContent = new HashMap<>();
            generatedContent.put("id", UUID.randomUUID().toString());
            generatedContent.put("type", type);
            generatedContent.put("title", "Contenu généré par IA");
            generatedContent.put("content", "Ce contenu a été généré en réponse à: " + prompt);
            generatedContent.put("difficulty", difficulty);
            generatedContent.put("status", "pending");
            generatedContent.put("createdAt", new Date());
            generatedContent.put("createdBy", trainer.getId());
            
            return ResponseEntity.ok(generatedContent);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error generating content", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping("/approve/{contentId}")
    public ResponseEntity<?> approveContent(
            @PathVariable String contentId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            // TODO: Implement content approval logic
            // This would typically mark the AI-generated content as approved
            // and potentially create the actual course/exercise/quiz entity
            
            return ResponseEntity.ok(Map.of("message", "Content approved successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error approving content", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/history")
    public ResponseEntity<?> getGenerationHistory(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
            
            // Get AI-generated content for this trainer
            List<Course> aiCourses = courseRepository.findAll().stream()
                .filter(c -> c.getCreatedBy() != null && 
                            c.getCreatedBy().getId().equals(trainer.getId()) && 
                            c.isAIGenerated())
                .toList();
            
            List<Map<String, Object>> history = new ArrayList<>();
            for (Course course : aiCourses) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", course.getId());
                item.put("type", "course");
                item.put("title", course.getTitle());
                item.put("content", course.getDescription());
                item.put("status", course.getStatus().toString().toLowerCase());
                item.put("createdAt", course.getCreatedAt());
                history.add(item);
            }
            
            // Also include AI-generated exercises and quizzes
            List<Exercise> aiExercises = exerciseRepository.findAll().stream()
                .filter(e -> e.getCreatedBy() != null && 
                            e.getCreatedBy().getId().equals(trainer.getId()) && 
                            e.isAIGenerated())
                .toList();
            
            for (Exercise exercise : aiExercises) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", exercise.getId());
                item.put("type", "exercise");
                item.put("title", exercise.getTitle());
                item.put("content", exercise.getDescription());
                item.put("status", exercise.getStatus().toString().toLowerCase());
                item.put("createdAt", exercise.getCreatedAt());
                history.add(item);
            }
            
            List<Quiz> aiQuizzes = quizRepository.findAll().stream()
                .filter(q -> q.getCreatedBy() != null && 
                            q.getCreatedBy().getId().equals(trainer.getId()) && 
                            q.isAIGenerated())
                .toList();
            
            for (Quiz quiz : aiQuizzes) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", quiz.getId());
                item.put("type", "quiz");
                item.put("title", quiz.getTitle());
                item.put("content", quiz.getDescription());
                item.put("status", quiz.getStatus().toString().toLowerCase());
                item.put("createdAt", quiz.getCreatedAt());
                history.add(item);
            }
            
            // Sort by creation date (newest first)
            history.sort((a, b) -> {
                Date dateA = (Date) a.get("createdAt");
                Date dateB = (Date) b.get("createdAt");
                if (dateA == null || dateB == null) return 0;
                return dateB.compareTo(dateA);
            });
            
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching generation history", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

