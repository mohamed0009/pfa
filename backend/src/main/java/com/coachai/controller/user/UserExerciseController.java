package com.coachai.controller.user;

import com.coachai.model.Exercise;
import com.coachai.model.ExerciseSubmission;
import com.coachai.model.User;
import com.coachai.repository.ExerciseRepository;
import com.coachai.repository.ExerciseSubmissionRepository;
import com.coachai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/exercises")
@CrossOrigin(origins = "http://localhost:4200")
public class UserExerciseController {
    @Autowired
    private ExerciseRepository exerciseRepository;
    
    @Autowired
    private ExerciseSubmissionRepository submissionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<?> getExercises(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            List<Exercise> exercises = exerciseRepository.findAll();
            if (exercises == null) {
                exercises = List.of();
            }
            return ResponseEntity.ok(exercises);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching exercises", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getExercise(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Exercise ID is required"));
            }
            
            Exercise exercise = exerciseRepository.findById(id).orElse(null);
            if (exercise == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Exercise not found", "id", id));
            }
            return ResponseEntity.ok(exercise);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching exercise", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping("/{id}/submissions")
    public ResponseEntity<?> submitExercise(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> submissionData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Exercise ID is required"));
            }
            
            if (submissionData == null || !submissionData.containsKey("content")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Submission content is required"));
            }
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            Exercise exercise = exerciseRepository.findById(id)
                .orElse(null);
            
            if (exercise == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Exercise not found"));
            }
            
            ExerciseSubmission submission = new ExerciseSubmission();
            submission.setExercise(exercise);
            submission.setUser(user);
            submission.setStatus(ExerciseSubmission.SubmissionStatus.SUBMITTED);
            submission.setSubmittedAt(LocalDateTime.now());
            submission.setContent((String) submissionData.get("content"));
            
            if (submissionData.containsKey("attachments")) {
                @SuppressWarnings("unchecked")
                List<String> attachments = (List<String>) submissionData.get("attachments");
                if (attachments != null) {
                    submission.setAttachments(attachments);
                }
            }
            
            ExerciseSubmission saved = submissionRepository.save(submission);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error submitting exercise", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/{id}/submissions")
    public ResponseEntity<?> getMySubmissions(
            @PathVariable String id,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Exercise ID is required"));
            }
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            Exercise exercise = exerciseRepository.findById(id)
                .orElse(null);
            
            if (exercise == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Exercise not found"));
            }
            
            List<ExerciseSubmission> submissions = submissionRepository.findByUserAndExercise(user, exercise);
            if (submissions == null) {
                submissions = List.of();
            }
            
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching submissions", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

