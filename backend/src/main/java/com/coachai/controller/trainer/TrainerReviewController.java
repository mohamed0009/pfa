package com.coachai.controller.trainer;

import com.coachai.model.ExerciseSubmission;
import com.coachai.model.QuizAttempt;
import com.coachai.model.User;
import com.coachai.repository.ExerciseSubmissionRepository;
import com.coachai.repository.QuizAttemptRepository;
import com.coachai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trainer/reviews")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerReviewController {
    @Autowired
    private ExerciseSubmissionRepository exerciseSubmissionRepository;
    
    @Autowired
    private QuizAttemptRepository quizAttemptRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/exercises/pending")
    public ResponseEntity<List<ExerciseSubmission>> getPendingExerciseReviews(Authentication authentication) {
        List<ExerciseSubmission> pending = exerciseSubmissionRepository
            .findByStatus(ExerciseSubmission.SubmissionStatus.SUBMITTED);
        return ResponseEntity.ok(pending);
    }
    
    @PostMapping("/exercises/{id}")
    public ResponseEntity<ExerciseSubmission> reviewExercise(
            @PathVariable String id,
            @RequestBody Map<String, Object> reviewData,
            Authentication authentication) {
        String email = authentication.getName();
        User trainer = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Trainer not found"));
        
        return exerciseSubmissionRepository.findById(id)
            .map(submission -> {
                if (reviewData.containsKey("feedback")) {
                    submission.setFeedback((String) reviewData.get("feedback"));
                }
                if (reviewData.containsKey("score")) {
                    submission.setScore(((Number) reviewData.get("score")).doubleValue());
                }
                submission.setGradedBy(trainer);
                submission.setStatus(ExerciseSubmission.SubmissionStatus.REVIEWED);
                submission.setReviewedAt(LocalDateTime.now());
                
                ExerciseSubmission saved = exerciseSubmissionRepository.save(submission);
                return ResponseEntity.ok(saved);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/quizzes/pending")
    public ResponseEntity<List<QuizAttempt>> getPendingQuizReviews(Authentication authentication) {
        List<QuizAttempt> attempts = quizAttemptRepository.findAll();
        // Filter attempts that might need review (could add a field for this)
        return ResponseEntity.ok(attempts);
    }
    
    @PostMapping("/quizzes/{id}")
    public ResponseEntity<QuizAttempt> reviewQuiz(
            @PathVariable String id,
            @RequestBody Map<String, String> reviewData,
            Authentication authentication) {
        String email = authentication.getName();
        User trainer = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Trainer not found"));
        
        return quizAttemptRepository.findById(id)
            .map(attempt -> {
                if (reviewData.containsKey("feedback")) {
                    // Store feedback in a comment or extension field
                    // For now, we'll just return the attempt
                }
                QuizAttempt saved = quizAttemptRepository.save(attempt);
                return ResponseEntity.ok(saved);
            })
            .orElse(ResponseEntity.notFound().build());
    }
}

