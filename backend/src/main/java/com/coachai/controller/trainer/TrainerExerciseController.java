package com.coachai.controller.trainer;

import com.coachai.model.Exercise;
import com.coachai.model.ExerciseSubmission;
import com.coachai.model.User;
import com.coachai.repository.ExerciseRepository;
import com.coachai.repository.ExerciseSubmissionRepository;
import com.coachai.repository.UserRepository;
import com.coachai.repository.CourseRepository;
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
    
    @Autowired
    private com.coachai.repository.CourseRepository courseRepository;
    
    @GetMapping
    public ResponseEntity<List<Exercise>> getExercises(
            @RequestParam(required = false) String courseId,
            Authentication authentication) {
        // Vérifier l'authentification
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(List.of());
        }
        
        List<Exercise> exercises;
        if (courseId != null) {
            exercises = exerciseRepository.findByCourseId(courseId);
        } else {
            exercises = exerciseRepository.findAll();
        }
        return ResponseEntity.ok(exercises);
    }
    
    @PostMapping
    public ResponseEntity<?> createExercise(
            @RequestBody java.util.Map<String, Object> exerciseData,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
            
            Exercise exercise = new Exercise();
            exercise.setCreatedBy(trainer);
            exercise.setStatus(com.coachai.model.ContentStatus.DRAFT);
            
            if (exerciseData.containsKey("title")) {
                exercise.setTitle((String) exerciseData.get("title"));
            }
            if (exerciseData.containsKey("description")) {
                exercise.setDescription((String) exerciseData.get("description"));
            }
            if (exerciseData.containsKey("instructions")) {
                exercise.setInstructions((String) exerciseData.get("instructions"));
            }
            if (exerciseData.containsKey("difficulty")) {
                try {
                    exercise.setDifficulty(Exercise.DifficultyLevel.valueOf(((String) exerciseData.get("difficulty")).toUpperCase()));
                } catch (Exception e) {
                    // Invalid difficulty, skip
                }
            }
            if (exerciseData.containsKey("estimatedTime")) {
                exercise.setEstimatedTime(((Number) exerciseData.get("estimatedTime")).intValue());
            }
            if (exerciseData.containsKey("type")) {
                try {
                    exercise.setType(Exercise.ExerciseType.valueOf(((String) exerciseData.get("type")).toUpperCase()));
                } catch (Exception e) {
                    exercise.setType(Exercise.ExerciseType.PRATIQUE);
                }
            }
            if (exerciseData.containsKey("courseId")) {
                String courseId = (String) exerciseData.get("courseId");
                com.coachai.model.Course course = courseRepository.findById(courseId).orElse(null);
                if (course != null) {
                    exercise.setCourse(course);
                }
            }
            
            Exercise saved = exerciseRepository.save(exercise);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error creating exercise", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateExercise(
            @PathVariable String id,
            @RequestBody java.util.Map<String, Object> updateData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(java.util.Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Exercise ID is required"));
            }
            
            if (updateData == null || updateData.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Request body is required"));
            }
            
            Exercise exercise = exerciseRepository.findById(id).orElse(null);
            if (exercise == null) {
                return ResponseEntity.status(404).body(java.util.Map.of("error", "Exercise not found"));
            }
            
            if (updateData.containsKey("title")) {
                exercise.setTitle((String) updateData.get("title"));
            }
            if (updateData.containsKey("description")) {
                exercise.setDescription((String) updateData.get("description"));
            }
            if (updateData.containsKey("instructions")) {
                exercise.setInstructions((String) updateData.get("instructions"));
            }
            if (updateData.containsKey("difficulty")) {
                try {
                    exercise.setDifficulty(Exercise.DifficultyLevel.valueOf(((String) updateData.get("difficulty")).toUpperCase()));
                } catch (Exception e) {
                    // Invalid difficulty, skip
                }
            }
            if (updateData.containsKey("estimatedTime")) {
                exercise.setEstimatedTime(((Number) updateData.get("estimatedTime")).intValue());
            }
            if (updateData.containsKey("type")) {
                try {
                    exercise.setType(Exercise.ExerciseType.valueOf(((String) updateData.get("type")).toUpperCase()));
                } catch (Exception e) {
                    // Invalid type, skip
                }
            }
            if (updateData.containsKey("status")) {
                try {
                    String statusStr = ((String) updateData.get("status")).toUpperCase();
                    exercise.setStatus(com.coachai.model.ContentStatus.valueOf(statusStr));
                } catch (Exception e) {
                    // Invalid status, skip
                }
            }
            
            Exercise saved = exerciseRepository.save(exercise);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error updating exercise", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExercise(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(java.util.Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Exercise ID is required"));
            }
            
            if (!exerciseRepository.existsById(id)) {
                return ResponseEntity.status(404).body(java.util.Map.of("error", "Exercise not found"));
            }
            
            exerciseRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error deleting exercise", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
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


