package com.coachai.controller.trainer;

import com.coachai.model.AIRecommendation;
import com.coachai.model.User;
import com.coachai.repository.AIRecommendationRepository;
import com.coachai.repository.UserRepository;
import com.coachai.service.AIAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/trainer/ai-recommendations")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerAIRecommendationController {

    @Autowired
    private AIAnalysisService aiAnalysisService;

    @Autowired
    private AIRecommendationRepository aiRecommendationRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Récupère toutes les recommandations IA générées
     */
    @GetMapping
    public ResponseEntity<?> getAIRecommendations(
            @RequestParam(required = false) String status,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            List<AIRecommendation> recommendations;
            
            if (status != null) {
                try {
                    AIRecommendation.RecommendationStatus recStatus = 
                        AIRecommendation.RecommendationStatus.valueOf(status.toUpperCase());
                    recommendations = aiRecommendationRepository.findByStatusOrderByCreatedAtDesc(recStatus);
                } catch (IllegalArgumentException e) {
                    recommendations = aiRecommendationRepository.findAllByOrderByCreatedAtDesc();
                }
            } else {
                recommendations = aiRecommendationRepository.findAllByOrderByCreatedAtDesc();
            }

            // Convertir en format attendu par le frontend
            List<Map<String, Object>> response = new ArrayList<>();
            for (AIRecommendation rec : recommendations) {
                Map<String, Object> recMap = convertToFrontendFormat(rec);
                response.add(recMap);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error fetching AI recommendations",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    /**
     * Récupère une recommandation spécifique
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAIRecommendation(@PathVariable String id) {
        try {
            Optional<AIRecommendation> recommendation = aiRecommendationRepository.findById(id);
            if (recommendation.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(convertToFrontendFormat(recommendation.get()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error fetching recommendation",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    /**
     * Génère de nouvelles recommandations IA pour tous les étudiants
     * Utilise le modèle ML de serve_model.py via AIAnalysisService
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generateAIRecommendations(Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            // Récupérer tous les étudiants
            List<User> students = userRepository.findByRole(User.UserRole.USER);
            
            List<AIRecommendation> newRecommendations = new ArrayList<>();
            
            // Générer des recommandations pour chaque étudiant en utilisant le modèle ML
            for (User student : students) {
                // Utiliser AIAnalysisService qui appelle le modèle ML
                List<Map<String, Object>> recommendations = aiAnalysisService.generateRecommendations(student);
                
                // Convertir les recommandations en entités AIRecommendation
                for (Map<String, Object> recoMap : recommendations) {
                    AIRecommendation recommendation = convertMapToEntity(recoMap, student);
                    
                    // Vérifier si une recommandation similaire existe déjà
                    if (!recommendationExists(recommendation)) {
                        newRecommendations.add(recommendation);
                    }
                }
            }
            
            // Sauvegarder les nouvelles recommandations
            List<AIRecommendation> saved = aiRecommendationRepository.saveAll(newRecommendations);
            
            // Convertir en format frontend
            List<Map<String, Object>> response = new ArrayList<>();
            for (AIRecommendation rec : saved) {
                response.add(convertToFrontendFormat(rec));
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error generating AI recommendations",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    /**
     * Approuve une recommandation IA (change le statut à APPROVED)
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveRecommendation(
            @PathVariable String id,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

            Optional<AIRecommendation> recommendationOpt = aiRecommendationRepository.findById(id);
            if (recommendationOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            AIRecommendation recommendation = recommendationOpt.get();
            recommendation.setStatus(AIRecommendation.RecommendationStatus.APPROVED);
            recommendation.setApprovedBy(trainer);
            recommendation.setApprovedAt(LocalDateTime.now());

            AIRecommendation saved = aiRecommendationRepository.save(recommendation);
            return ResponseEntity.ok(convertToFrontendFormat(saved));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error approving recommendation",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    /**
     * Publie une recommandation approuvée (change le statut à PUBLISHED pour qu'elle soit visible aux apprenants)
     */
    @PostMapping("/{id}/publish")
    public ResponseEntity<?> publishRecommendation(
            @PathVariable String id,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            // Vérifier que l'utilisateur est un formateur
            String email = authentication.getName();
            @SuppressWarnings("unused")
            User trainer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

            Optional<AIRecommendation> recommendationOpt = aiRecommendationRepository.findById(id);
            if (recommendationOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            AIRecommendation recommendation = recommendationOpt.get();
            if (recommendation.getStatus() != AIRecommendation.RecommendationStatus.APPROVED) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Only approved recommendations can be published"
                ));
            }

            recommendation.setStatus(AIRecommendation.RecommendationStatus.PUBLISHED);
            recommendation.setUpdatedAt(LocalDateTime.now());

            AIRecommendation saved = aiRecommendationRepository.save(recommendation);
            return ResponseEntity.ok(convertToFrontendFormat(saved));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error publishing recommendation",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    /**
     * Rejette une recommandation IA
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectRecommendation(
            @PathVariable String id,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            // Vérifier que l'utilisateur est un formateur (optionnel, mais bon pour la sécurité)
            String email = authentication.getName();
            @SuppressWarnings("unused")
            User trainer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

            Optional<AIRecommendation> recommendationOpt = aiRecommendationRepository.findById(id);
            if (recommendationOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            AIRecommendation recommendation = recommendationOpt.get();
            recommendation.setStatus(AIRecommendation.RecommendationStatus.REJECTED);
            recommendation.setUpdatedAt(LocalDateTime.now());

            AIRecommendation saved = aiRecommendationRepository.save(recommendation);
            return ResponseEntity.ok(convertToFrontendFormat(saved));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error rejecting recommendation",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    /**
     * Convertit une entité AIRecommendation en format attendu par le frontend
     */
    private Map<String, Object> convertToFrontendFormat(AIRecommendation rec) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", rec.getId());
        map.put("type", rec.getType().name());
        map.put("title", rec.getTitle());
        map.put("description", rec.getDescription());
        map.put("justification", rec.getJustification());
        
        // Format basedOnData
        Map<String, Object> basedOnData = new HashMap<>();
        basedOnData.put("studentCount", rec.getStudentCount() != null ? rec.getStudentCount() : 0);
        basedOnData.put("conversationTopics", rec.getConversationTopics());
        basedOnData.put("difficultyDetected", rec.getDifficultyDetected());
        basedOnData.put("level", rec.getLevel());
        basedOnData.put("specialty", rec.getSpecialty());
        map.put("basedOnData", basedOnData);
        
        map.put("suggestedContent", rec.getSuggestedContent());
        map.put("targetStudents", rec.getTargetStudents());
        map.put("priority", rec.getPriority().name());
        map.put("status", rec.getStatus().name());
        map.put("createdAt", rec.getCreatedAt());
        map.put("approvedAt", rec.getApprovedAt());
        map.put("approvedBy", rec.getApprovedBy() != null ? rec.getApprovedBy().getId() : null);
        
        return map;
    }

    /**
     * Convertit un Map de recommandation (depuis AIAnalysisService) en entité AIRecommendation
     */
    private AIRecommendation convertMapToEntity(Map<String, Object> recoMap, User student) {
        AIRecommendation rec = new AIRecommendation();
        
        rec.setType(AIRecommendation.RecommendationType.valueOf(
            ((String) recoMap.getOrDefault("type", "MODULE")).toUpperCase()
        ));
        rec.setTitle((String) recoMap.get("title"));
        rec.setJustification((String) recoMap.get("justification"));
        
        @SuppressWarnings("unchecked")
        List<String> basedOn = (List<String>) recoMap.getOrDefault("basedOn", new ArrayList<>());
        rec.setBasedOn(basedOn);
        
        rec.setTargetStudents(Collections.singletonList(student.getId()));
        rec.setPriority(AIRecommendation.Priority.valueOf(
            ((String) recoMap.getOrDefault("priority", "MEDIUM")).toUpperCase()
        ));
        rec.setStatus(AIRecommendation.RecommendationStatus.PENDING);
        
        // Extraire les données basées sur l'analyse
        if (basedOn != null && !basedOn.isEmpty()) {
            for (String data : basedOn) {
                if (data.contains("Niveau détecté:")) {
                    rec.setLevel(data.replace("Niveau détecté: ", ""));
                }
                if (data.contains("Difficulté:")) {
                    rec.setDifficultyDetected(data.replace("Difficulté: ", ""));
                }
            }
        }
        
        rec.setStudentCount(1);
        
        return rec;
    }

    /**
     * Vérifie si une recommandation similaire existe déjà
     */
    private boolean recommendationExists(AIRecommendation recommendation) {
        List<AIRecommendation> existing = aiRecommendationRepository.findAll();
        for (AIRecommendation existingRec : existing) {
            if (existingRec.getTitle().equals(recommendation.getTitle()) &&
                existingRec.getStatus() == AIRecommendation.RecommendationStatus.PENDING) {
                return true;
            }
        }
        return false;
    }
}

