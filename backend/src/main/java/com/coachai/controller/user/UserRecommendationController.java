package com.coachai.controller.user;

import com.coachai.model.AIRecommendation;
import com.coachai.model.User;
import com.coachai.repository.AIRecommendationRepository;
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
@RequestMapping("/api/user/recommendations")
@CrossOrigin(origins = "http://localhost:4200")
public class UserRecommendationController {
    
    @Autowired
    private AIRecommendationRepository aiRecommendationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Récupère les recommandations IA approuvées (PUBLISHED) pour l'étudiant connecté
     */
    @GetMapping
    public ResponseEntity<?> getApprovedRecommendations(Authentication authentication) {
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
            
            // Récupérer toutes les recommandations PUBLISHED
            List<AIRecommendation> allPublished = aiRecommendationRepository
                .findByStatusOrderByCreatedAtDesc(AIRecommendation.RecommendationStatus.PUBLISHED);
            
            // Filtrer celles qui ciblent cet étudiant
            List<Map<String, Object>> userRecommendations = new ArrayList<>();
            for (AIRecommendation rec : allPublished) {
                if (rec.getTargetStudents() != null && rec.getTargetStudents().contains(user.getId())) {
                    Map<String, Object> recMap = convertToFrontendFormat(rec);
                    userRecommendations.add(recMap);
                }
            }
            
            return ResponseEntity.ok(userRecommendations);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                Map.of("error", "Error fetching recommendations", 
                      "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Convertit une entité AIRecommendation en format attendu par le frontend
     */
    private Map<String, Object> convertToFrontendFormat(AIRecommendation rec) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", rec.getId());
        map.put("type", rec.getType().name().toLowerCase());
        map.put("title", rec.getTitle());
        map.put("description", rec.getDescription());
        map.put("reason", rec.getJustification());
        map.put("targetId", rec.getId()); // ID de la recommandation
        map.put("relevanceScore", rec.getPriority() == AIRecommendation.Priority.HIGH ? 95 : 
                                  rec.getPriority() == AIRecommendation.Priority.MEDIUM ? 75 : 60);
        map.put("createdAt", rec.getCreatedAt());
        map.put("isAIGenerated", true);
        return map;
    }
}

