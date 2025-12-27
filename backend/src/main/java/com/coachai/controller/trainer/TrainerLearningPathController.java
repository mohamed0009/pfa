package com.coachai.controller.trainer;

import com.coachai.model.CourseRecommendation;
import com.coachai.model.User;
import com.coachai.repository.CourseRecommendationRepository;
import com.coachai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trainer/learning-paths")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerLearningPathController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRecommendationRepository recommendationRepository;
    
    @GetMapping
    public ResponseEntity<?> getLearningPaths(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            // Récupérer toutes les recommandations en attente (PENDING) et acceptées (ACCEPTED)
            List<CourseRecommendation> pendingRecommendations = recommendationRepository.findByStatus(
                CourseRecommendation.RecommendationStatus.PENDING);
            List<CourseRecommendation> acceptedRecommendations = recommendationRepository.findByStatus(
                CourseRecommendation.RecommendationStatus.ACCEPTED);
            
            // Convertir les recommandations en parcours personnalisés
            List<Map<String, Object>> paths = new ArrayList<>();
            
            // Traiter les recommandations en attente
            for (CourseRecommendation rec : pendingRecommendations) {
                Map<String, Object> path = convertRecommendationToPath(rec, "draft");
                paths.add(path);
            }
            
            // Traiter les recommandations acceptées
            for (CourseRecommendation rec : acceptedRecommendations) {
                Map<String, Object> path = convertRecommendationToPath(rec, "active");
                paths.add(path);
            }
            
            return ResponseEntity.ok(paths);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching learning paths", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Convertit une recommandation en parcours personnalisé
     */
    private Map<String, Object> convertRecommendationToPath(CourseRecommendation rec, String status) {
        Map<String, Object> path = new HashMap<>();
        path.put("id", rec.getId());
        path.put("studentId", rec.getStudent().getId());
        String firstName = rec.getStudent().getFirstName() != null ? rec.getStudent().getFirstName() : "";
        String lastName = rec.getStudent().getLastName() != null ? rec.getStudent().getLastName() : "";
        String fullName = (firstName + " " + lastName).trim();
        if (fullName.isEmpty()) {
            fullName = rec.getStudent().getEmail() != null ? rec.getStudent().getEmail() : "Étudiant";
        }
        path.put("studentName", fullName);
        
        // Gérer la formation via le module du cours (peut être null)
        String formationId = null;
        String formationName = null;
        if (rec.getCourse() != null && rec.getCourse().getModule() != null) {
            var module = rec.getCourse().getModule();
            if (module.getFormation() != null) {
                formationId = module.getFormation().getId();
                formationName = module.getFormation().getTitle();
            }
        }
        path.put("formationId", formationId);
        path.put("formationName", formationName);
        path.put("baseFormationId", formationId);
        path.put("status", status);
        path.put("createdBy", rec.getReviewedBy() != null ? rec.getReviewedBy().getId() : null);
        path.put("createdAt", rec.getCreatedAt() != null ? rec.getCreatedAt().toString() : null);
        path.put("updatedAt", rec.getUpdatedAt() != null ? rec.getUpdatedAt().toString() : null);
        
        // Ajouter les informations de la recommandation
        List<Map<String, Object>> adjustments = new ArrayList<>();
        Map<String, Object> adjustment = new HashMap<>();
        adjustment.put("reason", rec.getReason() != null ? rec.getReason() : "Recommandation basée sur l'analyse IA");
        adjustment.put("confidenceScore", rec.getConfidenceScore());
        adjustment.put("courseTitle", rec.getCourse() != null ? rec.getCourse().getTitle() : "");
        adjustment.put("conversationExcerpt", rec.getConversationExcerpt());
        adjustments.add(adjustment);
        path.put("adjustments", adjustments);
        
        // Ajouter les suggestions IA
        List<String> aiSuggestions = new ArrayList<>();
        if (rec.getReason() != null) {
            aiSuggestions.add(rec.getReason());
        }
        if (rec.getConversationExcerpt() != null && !rec.getConversationExcerpt().equals("Aucun extrait disponible")) {
            aiSuggestions.add("Extrait de conversation: " + rec.getConversationExcerpt());
        }
        path.put("aiSuggestions", aiSuggestions);
        
        // Modules vides pour l'instant (peut être étendu)
        path.put("modules", new ArrayList<>());
        
        return path;
    }
    
    @PostMapping
    public ResponseEntity<?> createLearningPath(
            @RequestBody Map<String, Object> pathData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            // TODO: Implement learning path creation
            return ResponseEntity.ok(Map.of("message", "Learning path created successfully", "id", "path-1"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error creating learning path", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateLearningPath(
            @PathVariable String id,
            @RequestBody Map<String, Object> pathData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            // TODO: Implement learning path update
            return ResponseEntity.ok(Map.of("message", "Learning path updated successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error updating learning path", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

