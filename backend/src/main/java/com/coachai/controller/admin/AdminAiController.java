package com.coachai.controller.admin;

import com.coachai.model.ChatMessage;
import com.coachai.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/ai")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminAiController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

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
            long totalMessages = chatMessageRepository.count();
            // Placeholder stats
            return ResponseEntity.ok(Map.of(
                "totalInteractions", totalMessages,
                "averageResponseTime", 0,
                "flaggedInteractions", 0,
                "sentimentBreakdown", Map.of("positive", 0, "neutral", totalMessages, "negative", 0),
                "generatedContentCount", Map.of("quiz", 0, "exercise", 0, "summary", 0),
                "averageContentRating", 0,
                "knowledgeBaseSize", 0,
                "indexedDocuments", 0
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching stats"));
        }
    }
}
