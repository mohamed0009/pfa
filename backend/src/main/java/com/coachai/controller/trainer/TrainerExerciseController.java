package com.coachai.controller.trainer;

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

import java.util.List;

@RestController
@RequestMapping("/api/trainer/exercises")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerExerciseController {
    @Autowired
    private ExerciseRepository exerciseRepository;
    
    @Autowired
    private ExerciseSubmissionRepository submissionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/submissions")
    public ResponseEntity<List<ExerciseSubmission>> getSubmissions(
            @RequestParam(required = false) String status,
            Authentication authentication) {
        List<ExerciseSubmission> submissions;
        if (status != null) {
            submissions = submissionRepository.findByStatus(
                ExerciseSubmission.SubmissionStatus.valueOf(status.toUpperCase()));
        } else {
            submissions = submissionRepository.findAll();
        }
        return ResponseEntity.ok(submissions);
    }
    
    @PutMapping("/submissions/{id}/review")
    public ResponseEntity<ExerciseSubmission> reviewSubmission(
            @PathVariable String id,
            @RequestBody ExerciseSubmission review,
            Authentication authentication) {
        String email = authentication.getName();
        User trainer = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Trainer not found"));
        
        return submissionRepository.findById(id)
            .map(submission -> {
                submission.setFeedback(review.getFeedback());
                submission.setScore(review.getScore());
                submission.setGradedBy(trainer);
                submission.setStatus(ExerciseSubmission.SubmissionStatus.REVIEWED);
                submission.setReviewedAt(java.time.LocalDateTime.now());
                ExerciseSubmission saved = submissionRepository.save(submission);
                return ResponseEntity.ok(saved);
            })
            .orElse(ResponseEntity.notFound().build());
    }
}


