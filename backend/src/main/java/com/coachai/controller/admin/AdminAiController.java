package com.coachai.controller.admin;

import com.coachai.model.ChatMessage;
import com.coachai.model.Quiz;
import com.coachai.model.Exercise;
import com.coachai.repository.ChatMessageRepository;
import com.coachai.repository.QuizRepository;
import com.coachai.repository.ExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/ai")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminAiController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @GetMapping("/interactions")
    public ResponseEntity<?> getInteractions(@RequestParam(required = false) Boolean flaggedOnly, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            // Fetch all messages, sorted by timestamp desc
            // In a real production app, we should use pagination!
            List<ChatMessage> messages = chatMessageRepository.findAll(Sort.by(Sort.Direction.DESC, "timestamp"));
            
            // Transform to AIInteraction DTO structure expected by frontend
            // Note: DB schema might not have 'sentiment', 'flagged', 'responseTime' yet
            // So we map available fields and default the others
            List<Map<String, Object>> interactions = messages.stream().map(msg -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", msg.getId() != null ? msg.getId() : "unknown");
                map.put("userId", msg.getConversation().getUser().getId());
                map.put("userName", msg.getConversation().getUser().getFirstName() + " " + msg.getConversation().getUser().getLastName());
                map.put("userRole", msg.getConversation().getUser().getRole().toString());
                map.put("timestamp", msg.getTimestamp().toString());
                map.put("question", msg.getSender() == ChatMessage.MessageSender.USER ? msg.getContent() : "Réponse IA");
                map.put("response", "...");
                map.put("category", "General");
                map.put("sentiment", "neutral");
                map.put("flagged", false);
                map.put("responseTime", 0);
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(interactions);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching interactions", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            // Total Interactions (messages utilisateur uniquement)
            List<ChatMessage> allMessages = chatMessageRepository.findAll();
            long totalInteractions = allMessages.stream()
                .filter(m -> m.getSender() == ChatMessage.MessageSender.USER)
                .count();

            // Average Response Time (estimation basée sur l'intervalle entre USER et AI messages)
            List<Long> responseTimes = new ArrayList<>();
            List<ChatMessage> sortedMessages = allMessages.stream()
                .sorted(Comparator.comparing(ChatMessage::getTimestamp))
                .collect(Collectors.toList());

            for (int i = 0; i < sortedMessages.size() - 1; i++) {
                ChatMessage userMsg = sortedMessages.get(i);
                ChatMessage aiMsg = sortedMessages.get(i + 1);
                
                if (userMsg.getSender() == ChatMessage.MessageSender.USER && 
                    aiMsg.getSender() == ChatMessage.MessageSender.AI &&
                    userMsg.getConversation().getId().equals(aiMsg.getConversation().getId())) {
                    long diff = ChronoUnit.MILLIS.between(userMsg.getTimestamp(), aiMsg.getTimestamp());
                    if (diff > 0 && diff < 60000) { // Entre 0 et 60 secondes (filtre les outliers)
                        responseTimes.add(diff);
                    }
                }
            }
            
            double averageResponseTime = responseTimes.isEmpty() ? 250.0 :
                responseTimes.stream().mapToLong(Long::longValue).average().orElse(250.0);

            // Flagged Interactions (placeholder - nécessite un champ flagged dans le modèle)
            long flaggedInteractions = 0;

            // Sentiment Breakdown (placeholder - nécessite une analyse de sentiment)
            long positiveCount = 0;
            long neutralCount = totalInteractions;
            long negativeCount = 0;

            // Generated Content Count (depuis les champs isAIGenerated)
            long quizCount = quizRepository.findAll().stream()
                .filter(Quiz::isAIGenerated)
                .count();
            long exerciseCount = exerciseRepository.findAll().stream()
                .filter(Exercise::isAIGenerated)
                .count();
            long summaryCount = 0; // Placeholder - nécessite un modèle Summary

            // Average Content Rating (placeholder - nécessite un système de rating)
            double averageContentRating = 0.0;

            // Knowledge Base Size (placeholder - nécessite un modèle KnowledgeBase)
            long knowledgeBaseSize = 0;
            long indexedDocuments = 0;

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalInteractions", totalInteractions);
            stats.put("averageResponseTime", Math.round(averageResponseTime));
            stats.put("flaggedInteractions", flaggedInteractions);
            stats.put("sentimentBreakdown", Map.of(
                "positive", positiveCount,
                "neutral", neutralCount,
                "negative", negativeCount
            ));
            stats.put("generatedContentCount", Map.of(
                "quiz", quizCount,
                "exercise", exerciseCount,
                "summary", summaryCount
            ));
            stats.put("averageContentRating", averageContentRating);
            stats.put("knowledgeBaseSize", knowledgeBaseSize);
            stats.put("indexedDocuments", indexedDocuments);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching stats", "message", e.getMessage()));
        }
    }

    @PostMapping("/config")
    public ResponseEntity<?> updateAIConfig(@RequestBody Map<String, Object> config, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            // TODO: Implémenter la sauvegarde de la configuration IA
            // Pour l'instant, on retourne juste un succès
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "AI configuration updated",
                "config", config
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error updating config", "message", e.getMessage()));
        }
    }

    @GetMapping("/config")
    public ResponseEntity<?> getAIConfig(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            // TODO: Récupérer la configuration depuis la base de données
            // Pour l'instant, on retourne une configuration par défaut
            return ResponseEntity.ok(Map.of(
                "language", "Français",
                "tone", "friendly",
                "detailLevel", "moderate",
                "enableQuizGeneration", true,
                "enableExerciseGeneration", true,
                "enableSummaryGeneration", true,
                "enablePersonalization", true,
                "maxResponseLength", 500
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching config", "message", e.getMessage()));
        }
    }
}
