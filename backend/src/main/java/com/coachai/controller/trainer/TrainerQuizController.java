package com.coachai.controller.trainer;

import com.coachai.model.Quiz;
import com.coachai.model.User;
import com.coachai.repository.QuizRepository;
import com.coachai.repository.UserRepository;
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
    
    @GetMapping
    public ResponseEntity<List<Quiz>> getQuizzes(
            @RequestParam(required = false) String courseId,
            Authentication authentication) {
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
    
    @PostMapping
    public ResponseEntity<Quiz> createQuiz(
            @RequestBody Quiz quiz,
            Authentication authentication) {
        String email = authentication.getName();
        User trainer = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Trainer not found"));
        
        Quiz saved = quizRepository.save(quiz);
        return ResponseEntity.ok(saved);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Quiz> updateQuiz(
            @PathVariable String id,
            @RequestBody Quiz updatedQuiz) {
        return quizRepository.findById(id)
            .map(quiz -> {
                quiz.setTitle(updatedQuiz.getTitle());
                quiz.setDescription(updatedQuiz.getDescription());
                quiz.setPassingScore(updatedQuiz.getPassingScore());
                Quiz saved = quizRepository.save(quiz);
                return ResponseEntity.ok(saved);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable String id) {
        quizRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

