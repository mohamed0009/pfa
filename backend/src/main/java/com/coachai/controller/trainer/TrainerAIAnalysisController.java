package com.coachai.controller.trainer;

import com.coachai.model.User;
import com.coachai.repository.UserRepository;
import com.coachai.service.AIAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/trainer/ai-analysis")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerAIAnalysisController {

    @Autowired
    private AIAnalysisService aiAnalysisService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Obtenir l'analyse IA d'un étudiant spécifique
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentAIAnalysis(@PathVariable String studentId,
                                                   Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

            // Prédire le niveau avec le modèle ML
            Map<String, Object> levelPrediction = aiAnalysisService.predictStudentLevel(student);
            
            // Analyser les difficultés via conversations
            List<Map<String, Object>> difficulties = aiAnalysisService.analyzeConversationDifficulties(student);
            
            // Générer recommandations
            List<Map<String, Object>> recommendations = aiAnalysisService.generateRecommendations(student);

            Map<String, Object> analysis = new HashMap<>();
            analysis.put("levelPrediction", levelPrediction);
            analysis.put("difficulties", difficulties);
            analysis.put("recommendations", recommendations);

            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error generating AI analysis",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    /**
     * Obtenir l'analyse globale des conversations (tous les étudiants)
     */
    @GetMapping("/conversations")
    public ResponseEntity<?> getConversationsAnalysis(
            @RequestParam(required = false, defaultValue = "30days") String period,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            // Pour l'instant, retourner des données mock
            // TODO: implémenter l'analyse réelle
            Map<String, Object> analysis = new HashMap<>();
            analysis.put("period", period);
            analysis.put("totalConversations", 247);
            analysis.put("totalMessages", 1834);
            analysis.put("uniqueStudents", 45);
            
            List<Map<String, Object>> topicsDetected = new ArrayList<>();
            topicsDetected.add(Map.of(
                "topic", "Centrer un div (CSS)",
                "count", 34,
                "relatedCourse", "Les Bases de CSS",
                "severity", "HIGH",
                "trend", "rising"
            ));
            topicsDetected.add(Map.of(
                "topic", "Boucles for Python",
                "count", 28,
                "relatedCourse", "Python pour Débutants",
                "severity", "MEDIUM",
                "trend", "stable"
            ));
            
            analysis.put("topicsDetected", topicsDetected);
            
            List<Map<String, Object>> frequentQuestions = new ArrayList<>();
            frequentQuestions.add(Map.of(
                "question", "Comment centrer un div en CSS?",
                "count", 34,
                "studentsAsked", 18,
                "averageRepetitions", 1.9,
                "relatedModule", "CSS et Design",
                "suggestedAction", "Créer un module 'CSS Flexbox & Grid Pratique'"
            ));
            
            analysis.put("frequentQuestions", frequentQuestions);
            
            List<Map<String, Object>> difficulties = new ArrayList<>();
            difficulties.add(Map.of(
                "subject", "Positionnement CSS",
                "level", "HIGH",
                "studentCount", 24,
                "averageAttempts", 3.5,
                "suggestedSolution", "Module 'CSS Layout Moderne' avec exercices pratiques",
                "priority", 1
            ));
            
            analysis.put("difficultiesDetected", difficulties);
            
            Map<String, Integer> levelDist = new HashMap<>();
            levelDist.put("Débutant", 45);
            levelDist.put("Débutant+", 30);
            levelDist.put("Intermédiaire", 20);
            levelDist.put("Avancé", 5);
            analysis.put("levelDistribution", levelDist);

            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error analyzing conversations",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }
}

