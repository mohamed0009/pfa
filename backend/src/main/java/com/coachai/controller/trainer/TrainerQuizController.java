package com.coachai.controller.trainer;

import com.coachai.model.Quiz;
import com.coachai.model.User;
import com.coachai.model.Course;
import com.coachai.repository.QuizRepository;
import com.coachai.repository.UserRepository;
import com.coachai.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainer/quizzes")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerQuizController {
    @Autowired
    private QuizRepository quizRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @GetMapping
    public ResponseEntity<List<Quiz>> getQuizzes(
            @RequestParam(required = false) String courseId,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        
        String email = authentication.getName();
        User trainer = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Trainer not found"));
        
        List<Quiz> quizzes;
        if (courseId != null) {
            quizzes = quizRepository.findByCourseId(courseId);
        } else {
            // Get all quizzes for trainer
            quizzes = quizRepository.findAll();
        }
        
        return ResponseEntity.ok(quizzes);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable String id, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        return quizRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> createQuiz(
            @RequestBody java.util.Map<String, Object> quizData,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
            
            Quiz quiz = new Quiz();
            quiz.setCreatedBy(trainer);
            // Par défaut, les quiz sont PUBLISHED pour être visibles par les apprenants
            quiz.setStatus(com.coachai.model.ContentStatus.PUBLISHED);
            
            if (quizData.containsKey("title")) {
                quiz.setTitle((String) quizData.get("title"));
            }
            if (quizData.containsKey("description")) {
                quiz.setDescription((String) quizData.get("description"));
            }
            if (quizData.containsKey("difficulty")) {
                try {
                    quiz.setDifficulty(Quiz.DifficultyLevel.valueOf(((String) quizData.get("difficulty")).toUpperCase()));
                } catch (Exception e) {
                    // Invalid difficulty, skip
                }
            }
            if (quizData.containsKey("duration")) {
                quiz.setDuration(((Number) quizData.get("duration")).intValue());
            }
            if (quizData.containsKey("passingScore")) {
                quiz.setPassingScore(((Number) quizData.get("passingScore")).intValue());
            }
            if (quizData.containsKey("maxAttempts")) {
                quiz.setMaxAttempts(((Number) quizData.get("maxAttempts")).intValue());
            }
            if (quizData.containsKey("courseId")) {
                String courseId = (String) quizData.get("courseId");
                Course course = courseRepository.findById(courseId).orElse(null);
                if (course != null) {
                    quiz.setCourse(course);
                }
            }
            
            Quiz saved = quizRepository.save(quiz);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error creating quiz", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuiz(
            @PathVariable String id,
            @RequestBody java.util.Map<String, Object> updateData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(java.util.Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Quiz ID is required"));
            }
            
            if (updateData == null || updateData.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Request body is required"));
            }
            
            Quiz quiz = quizRepository.findById(id).orElse(null);
            if (quiz == null) {
                return ResponseEntity.status(404).body(java.util.Map.of("error", "Quiz not found"));
            }
            
            if (updateData.containsKey("title")) {
                quiz.setTitle((String) updateData.get("title"));
            }
            if (updateData.containsKey("description")) {
                quiz.setDescription((String) updateData.get("description"));
            }
            if (updateData.containsKey("difficulty")) {
                try {
                    quiz.setDifficulty(Quiz.DifficultyLevel.valueOf(((String) updateData.get("difficulty")).toUpperCase()));
                } catch (Exception e) {
                    // Invalid difficulty, skip
                }
            }
            if (updateData.containsKey("duration")) {
                quiz.setDuration(((Number) updateData.get("duration")).intValue());
            }
            if (updateData.containsKey("passingScore")) {
                quiz.setPassingScore(((Number) updateData.get("passingScore")).intValue());
            }
            if (updateData.containsKey("maxAttempts")) {
                quiz.setMaxAttempts(((Number) updateData.get("maxAttempts")).intValue());
            }
            if (updateData.containsKey("status")) {
                try {
                    String statusStr = ((String) updateData.get("status")).toUpperCase();
                    quiz.setStatus(com.coachai.model.ContentStatus.valueOf(statusStr));
                } catch (Exception e) {
                    // Invalid status, skip
                }
            }
            
            Quiz saved = quizRepository.save(quiz);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error updating quiz", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(java.util.Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Quiz ID is required"));
            }
            
            if (!quizRepository.existsById(id)) {
                return ResponseEntity.status(404).body(java.util.Map.of("error", "Quiz not found"));
            }
            
            quizRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error deleting quiz", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

