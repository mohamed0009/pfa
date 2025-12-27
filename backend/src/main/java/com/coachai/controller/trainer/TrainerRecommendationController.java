package com.coachai.controller.trainer;

import com.coachai.model.CourseRecommendation;
import com.coachai.model.User;
import com.coachai.repository.CourseRecommendationRepository;
import com.coachai.repository.UserRepository;
import com.coachai.service.CourseRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/trainer/recommendations")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerRecommendationController {
    
    @Autowired
    private CourseRecommendationRepository recommendationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRecommendationService recommendationService;
    
    /**
     * Récupère toutes les recommandations en attente
     */
    @GetMapping
    public ResponseEntity<?> getRecommendations(
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) String status,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            List<CourseRecommendation> recommendations;
            
            if (studentId != null) {
                Optional<User> student = userRepository.findById(studentId);
                if (student.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Student not found"));
                }
                
                if (status != null) {
                    try {
                        CourseRecommendation.RecommendationStatus recStatus = 
                            CourseRecommendation.RecommendationStatus.valueOf(status.toUpperCase());
                        recommendations = recommendationRepository.findByStudentAndStatus(student.get(), recStatus);
                    } catch (IllegalArgumentException e) {
                        recommendations = recommendationRepository.findByStudentOrderByCreatedAtDesc(student.get());
                    }
                } else {
                    recommendations = recommendationRepository.findByStudentOrderByCreatedAtDesc(student.get());
                }
            } else if (status != null) {
                try {
                    CourseRecommendation.RecommendationStatus recStatus = 
                        CourseRecommendation.RecommendationStatus.valueOf(status.toUpperCase());
                    recommendations = recommendationRepository.findByStatus(recStatus);
                } catch (IllegalArgumentException e) {
                    recommendations = recommendationRepository.findAll();
                }
            } else {
                recommendations = recommendationRepository.findAll();
            }
            
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                Map.of("error", "Error fetching recommendations", 
                      "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Récupère une recommandation spécifique
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getRecommendation(@PathVariable String id) {
        try {
            Optional<CourseRecommendation> recommendation = recommendationRepository.findById(id);
            if (recommendation.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(recommendation.get());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                Map.of("error", "Error fetching recommendation", 
                      "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Génère des recommandations pour un étudiant
     */
    @PostMapping("/generate/{studentId}")
    public ResponseEntity<?> generateRecommendations(
            @PathVariable String studentId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            Optional<User> student = userRepository.findById(studentId);
            if (student.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Student not found"));
            }
            
            List<CourseRecommendation> recommendations = recommendationService.generateRecommendations(student.get());
            
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                Map.of("error", "Error generating recommendations", 
                      "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Accepte une recommandation
     */
    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptRecommendation(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> requestData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
            
            Optional<CourseRecommendation> recommendationOpt = recommendationRepository.findById(id);
            if (recommendationOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            CourseRecommendation recommendation = recommendationOpt.get();
            recommendation.setStatus(CourseRecommendation.RecommendationStatus.ACCEPTED);
            recommendation.setReviewedBy(trainer);
            recommendation.setReviewedAt(LocalDateTime.now());
            
            if (requestData != null && requestData.containsKey("notes")) {
                recommendation.setReviewNotes((String) requestData.get("notes"));
            }
            
            CourseRecommendation saved = recommendationRepository.save(recommendation);
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                Map.of("error", "Error accepting recommendation", 
                      "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Rejette une recommandation
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectRecommendation(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> requestData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
            
            Optional<CourseRecommendation> recommendationOpt = recommendationRepository.findById(id);
            if (recommendationOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            CourseRecommendation recommendation = recommendationOpt.get();
            recommendation.setStatus(CourseRecommendation.RecommendationStatus.REJECTED);
            recommendation.setReviewedBy(trainer);
            recommendation.setReviewedAt(LocalDateTime.now());
            
            if (requestData != null && requestData.containsKey("notes")) {
                recommendation.setReviewNotes((String) requestData.get("notes"));
            }
            
            CourseRecommendation saved = recommendationRepository.save(recommendation);
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                Map.of("error", "Error rejecting recommendation", 
                      "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

