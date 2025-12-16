package com.coachai.controller.user;

import com.coachai.model.*;
import com.coachai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/quizzes")
@CrossOrigin(origins = "http://localhost:4200")
public class UserQuizController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private QuizRepository quizRepository;
    
    @Autowired
    private QuizAttemptRepository quizAttemptRepository;
    
    @Autowired
    private QuizAnswerRepository quizAnswerRepository;
    
    @Autowired
    private QuizQuestionRepository quizQuestionRepository;
    
    @GetMapping
    public ResponseEntity<?> getAvailableQuizzes(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            List<Quiz> quizzes = quizRepository.findAll();
            if (quizzes == null) {
                quizzes = List.of();
            }
            return ResponseEntity.ok(quizzes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching quizzes", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/{quizId}")
    public ResponseEntity<?> getQuiz(@PathVariable String quizId, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (quizId == null || quizId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Quiz ID is required"));
            }
            
            Quiz quiz = quizRepository.findById(quizId).orElse(null);
            if (quiz == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Quiz not found", "quizId", quizId));
            }
            return ResponseEntity.ok(quiz);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching quiz", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping("/{quizId}/attempts")
    public ResponseEntity<?> startQuizAttempt(
            @PathVariable String quizId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (quizId == null || quizId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Quiz ID is required"));
            }
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            Quiz quiz = quizRepository.findById(quizId)
                .orElse(null);
            
            if (quiz == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Quiz not found"));
            }
            
            List<QuizAttempt> existingAttempts = quizAttemptRepository.findByUserAndQuiz(user, quiz);
            int attemptNumber = (existingAttempts != null ? existingAttempts.size() : 0) + 1;
            
            int maxAttempts = quiz.getMaxAttempts() > 0 ? quiz.getMaxAttempts() : 3;
            if (attemptNumber > maxAttempts) {
                return ResponseEntity.badRequest().body(Map.of("error", "Maximum attempts reached", "maxAttempts", maxAttempts));
            }
            
            QuizAttempt attempt = new QuizAttempt();
            attempt.setQuiz(quiz);
            attempt.setUser(user);
            attempt.setAttemptNumber(attemptNumber);
            attempt.setStartedAt(LocalDateTime.now());
            attempt.setScore(0.0);
            attempt.setPassed(false);
            
            QuizAttempt saved = quizAttemptRepository.save(attempt);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error starting quiz attempt", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping("/attempts/{attemptId}/submit")
    public ResponseEntity<?> submitQuizAttempt(
            @PathVariable String attemptId,
            @RequestBody(required = false) List<Map<String, Object>> answerData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (attemptId == null || attemptId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Attempt ID is required"));
            }
            
            if (answerData == null || answerData.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Answers are required"));
            }
            
            QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElse(null);
            
            if (attempt == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Attempt not found"));
            }
            
            double totalScore = 0.0;
            double maxScore = 0.0;
            
            for (Map<String, Object> data : answerData) {
                String questionId = (String) data.get("questionId");
                String userAnswer = (String) data.get("userAnswer");
                
                if (questionId == null || questionId.isEmpty()) {
                    continue;
                }
                
                QuizQuestion question = quizQuestionRepository.findById(questionId)
                    .orElse(null);
                
                if (question == null) {
                    continue;
                }
                
                maxScore += question.getPoints();
                
                QuizAnswer answer = new QuizAnswer();
                answer.setAttempt(attempt);
                answer.setQuestion(question);
                answer.setUserAnswer(userAnswer != null ? userAnswer : "");
                
                // Check if answer is correct
                boolean isCorrect = checkAnswer(question, userAnswer);
                answer.setCorrect(isCorrect);
                
                if (isCorrect) {
                    answer.setPointsEarned(question.getPoints());
                    totalScore += question.getPoints();
                } else {
                    answer.setPointsEarned(0.0);
                }
                
                quizAnswerRepository.save(answer);
            }
            
            double percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0.0;
            attempt.setScore(percentage);
            
            if (attempt.getQuiz() != null) {
                attempt.setPassed(percentage >= attempt.getQuiz().getPassingScore());
            }
            attempt.setSubmittedAt(LocalDateTime.now());
            
            QuizAttempt saved = quizAttemptRepository.save(attempt);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error submitting quiz", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/attempts")
    public ResponseEntity<?> getUserAttempts(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            List<QuizAttempt> attempts = quizAttemptRepository.findByUser(user);
            if (attempts == null) {
                attempts = List.of();
            }
            
            return ResponseEntity.ok(attempts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching attempts", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    private boolean checkAnswer(QuizQuestion question, String userAnswer) {
        if (question.getCorrectAnswer() == null) {
            return false;
        }
        return question.getCorrectAnswer().equalsIgnoreCase(userAnswer.trim());
    }
}

