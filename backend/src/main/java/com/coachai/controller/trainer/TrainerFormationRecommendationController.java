package com.coachai.controller.trainer;

import com.coachai.model.*;
import com.coachai.repository.*;
import com.coachai.service.FormationRecommendationService;
import com.coachai.service.StudentLevelAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Contrôleur pour gérer les recommandations de formations basées sur l'analyse ML
 */
@RestController
@RequestMapping("/api/trainer/ml-recommendations")
@CrossOrigin(origins = "*")
public class TrainerFormationRecommendationController {

    @Autowired
    private FormationRecommendationService formationRecommendationService;

    @Autowired
    private StudentLevelAnalysisService studentLevelAnalysisService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AIRecommendationRepository aiRecommendationRepository;

    @Autowired
    private FormationRepository formationRepository;

    /**
     * Récupère toutes les recommandations en attente pour le formateur
     */
    @GetMapping
    public ResponseEntity<?> getRecommendations(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email).orElse(null);

            if (trainer == null || trainer.getRole() != User.UserRole.TRAINER) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            List<AIRecommendation> recommendations = formationRecommendationService.getRecommendationsForTrainer(trainer);

            // Enrichir avec les informations des étudiants
            List<Map<String, Object>> enrichedRecommendations = new ArrayList<>();
            for (AIRecommendation rec : recommendations) {
                Map<String, Object> enriched = new HashMap<>();
                enriched.put("id", rec.getId());
                enriched.put("title", rec.getTitle());
                enriched.put("description", rec.getDescription());
                enriched.put("justification", rec.getJustification());
                enriched.put("level", rec.getLevel());
                enriched.put("specialty", rec.getSpecialty());
                enriched.put("priority", rec.getPriority().toString());
                enriched.put("status", rec.getStatus().toString());
                enriched.put("confidence", extractConfidence(rec.getBasedOn()));
                enriched.put("topics", rec.getConversationTopics());
                enriched.put("createdAt", rec.getCreatedAt());

                // Informations des étudiants
                List<Map<String, Object>> students = new ArrayList<>();
                for (String studentId : rec.getTargetStudents()) {
                    userRepository.findById(studentId).ifPresent(student -> {
                        Map<String, Object> studentInfo = new HashMap<>();
                        studentInfo.put("id", student.getId());
                        studentInfo.put("name", student.getFirstName() + " " + student.getLastName());
                        studentInfo.put("email", student.getEmail());
                        students.add(studentInfo);
                    });
                }
                enriched.put("students", students);
                enriched.put("studentCount", students.size());

                enrichedRecommendations.add(enriched);
            }

            return ResponseEntity.ok(enrichedRecommendations);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error fetching recommendations",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    /**
     * Récupère les détails d'une recommandation spécifique
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getRecommendationDetails(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            AIRecommendation recommendation = aiRecommendationRepository.findById(id).orElse(null);
            if (recommendation == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Recommendation not found"));
            }

            Map<String, Object> details = new HashMap<>();
            details.put("id", recommendation.getId());
            details.put("title", recommendation.getTitle());
            details.put("description", recommendation.getDescription());
            details.put("justification", recommendation.getJustification());
            details.put("level", recommendation.getLevel());
            details.put("specialty", recommendation.getSpecialty());
            details.put("priority", recommendation.getPriority().toString());
            details.put("status", recommendation.getStatus().toString());
            details.put("topics", recommendation.getConversationTopics());
            details.put("basedOn", recommendation.getBasedOn());
            details.put("createdAt", recommendation.getCreatedAt());

            // Informations des étudiants avec analyse détaillée
            List<Map<String, Object>> studentsDetails = new ArrayList<>();
            for (String studentId : recommendation.getTargetStudents()) {
                userRepository.findById(studentId).ifPresent(student -> {
                    Map<String, Object> studentDetail = new HashMap<>();
                    studentDetail.put("id", student.getId());
                    studentDetail.put("name", student.getFirstName() + " " + student.getLastName());
                    studentDetail.put("email", student.getEmail());

                    // Analyse ML du niveau de l'étudiant
                    Map<String, Object> levelAnalysis = studentLevelAnalysisService.predictStudentLevel(student);
                    studentDetail.put("levelAnalysis", levelAnalysis);

                    studentsDetails.add(studentDetail);
                });
            }
            details.put("students", studentsDetails);

            return ResponseEntity.ok(details);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error fetching recommendation details",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    /**
     * Applique une recommandation (création d'une formation)
     */
    @PostMapping("/{id}/apply")
    public ResponseEntity<?> applyRecommendation(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> formationData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email).orElse(null);

            if (trainer == null || trainer.getRole() != User.UserRole.TRAINER) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            AIRecommendation recommendation = aiRecommendationRepository.findById(id).orElse(null);
            if (recommendation == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Recommendation not found"));
            }

            if (recommendation.getStatus() != AIRecommendation.RecommendationStatus.PENDING) {
                return ResponseEntity.status(400).body(Map.of(
                    "error", "Recommendation already processed",
                    "status", recommendation.getStatus().toString()
                ));
            }

            // Appliquer la recommandation (créer la formation)
            Formation formation = formationRecommendationService.applyRecommendation(
                recommendation, trainer, formationData
            );

            return ResponseEntity.ok(Map.of(
                "message", "Recommendation applied successfully",
                "formation", formation,
                "recommendationId", recommendation.getId()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error applying recommendation",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    /**
     * Génère des recommandations pour tous les étudiants
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generateRecommendations(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null || user.getRole() != User.UserRole.TRAINER) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            List<AIRecommendation> recommendations = 
                formationRecommendationService.analyzeAllStudentsAndGenerateRecommendations();

            return ResponseEntity.ok(Map.of(
                "message", "Recommendations generated successfully",
                "count", recommendations.size(),
                "recommendations", recommendations
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error generating recommendations",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    /**
     * Extrait la confiance depuis les données "basedOn"
     */
    private Double extractConfidence(List<String> basedOn) {
        if (basedOn == null) return 0.0;
        
        for (String data : basedOn) {
            if (data.contains("confiance:")) {
                try {
                    String confStr = data.substring(data.indexOf("confiance:") + 10);
                    confStr = confStr.replace("%", "").trim();
                    return Double.parseDouble(confStr) / 100.0;
                } catch (Exception e) {
                    // Ignorer les erreurs de parsing
                }
            }
        }
        return 0.75; // Valeur par défaut
    }
}

