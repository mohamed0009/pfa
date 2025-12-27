package com.coachai.controller.user;

import com.coachai.model.ChatAttachment;
import com.coachai.model.ChatMessage;
import com.coachai.model.Conversation;
import com.coachai.model.User;
import com.coachai.repository.ChatAttachmentRepository;
import com.coachai.repository.ChatMessageRepository;
import com.coachai.repository.ConversationRepository;
import com.coachai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user/chat")
@CrossOrigin(origins = "http://localhost:4200")
public class ChatController {
    @Autowired
    private ConversationRepository conversationRepository;
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private com.coachai.service.AiService aiService;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private com.coachai.service.ChatAnalysisService chatAnalysisService;
    
    @Autowired
    private com.coachai.service.FormationRecommendationService formationRecommendationService;
    
    @Autowired
    private ChatAttachmentRepository chatAttachmentRepository;
    
    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(Authentication authentication) {
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
            
            List<Conversation> conversations = conversationRepository.findByUserOrderByLastMessageDateDesc(user);
            if (conversations == null) {
                conversations = List.of();
            }
            
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching conversations", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable String conversationId, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (conversationId == null || conversationId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Conversation ID is required"));
            }
            
            Optional<Conversation> conversation = conversationRepository.findById(conversationId);
            if (conversation.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Conversation not found"));
            }
            
            List<ChatMessage> messages = chatMessageRepository.findByConversationOrderByTimestampAsc(conversation.get());
            if (messages == null) {
                messages = List.of();
            }
            
            // Map messages with attachments
            List<Map<String, Object>> messagesWithAttachments = messages.stream().map(msg -> {
                Map<String, Object> msgMap = new java.util.HashMap<>();
                msgMap.put("id", msg.getId());
                msgMap.put("conversationId", msg.getConversation().getId());
                msgMap.put("sender", msg.getSender().toString());
                msgMap.put("content", msg.getContent());
                msgMap.put("timestamp", msg.getTimestamp());
                msgMap.put("type", msg.getType().toString());
                
                // Load attachments for this message
                List<ChatAttachment> attachments = chatAttachmentRepository.findByMessage(msg);
                List<Map<String, Object>> attList = attachments.stream().map(att -> {
                    Map<String, Object> attMap = new java.util.HashMap<>();
                    attMap.put("id", att.getId());
                    attMap.put("type", att.getType().toString());
                    attMap.put("title", att.getTitle());
                    attMap.put("url", att.getUrl());
                    return attMap;
                }).collect(java.util.stream.Collectors.toList());
                msgMap.put("attachments", attList);
                
                return msgMap;
            }).collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(messagesWithAttachments);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching messages", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping("/conversations")
    public ResponseEntity<?> createConversation(
            @RequestBody(required = false) Map<String, Object> conversationData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (conversationData == null || conversationData.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Request body is required"));
            }
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            Conversation conversation = new Conversation();
            conversation.setUser(user);
            conversation.setActive(true);
            
            if (conversationData.containsKey("title")) {
                conversation.setTitle((String) conversationData.get("title"));
            } else {
                conversation.setTitle("Nouvelle conversation");
            }
            
            Conversation saved = conversationRepository.save(conversation);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error creating conversation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<?> sendMessage(
            @PathVariable String conversationId,
            @RequestBody(required = false) Map<String, Object> messageData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (conversationId == null || conversationId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Conversation ID is required"));
            }
            
            if (messageData == null || !messageData.containsKey("content")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message content is required"));
            }
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            Optional<Conversation> conversation = conversationRepository.findById(conversationId);
            if (conversation.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Conversation not found"));
            }
            
            // 1. Save User Message
            ChatMessage message = new ChatMessage();
            message.setConversation(conversation.get());
            message.setSender(ChatMessage.MessageSender.USER);
            message.setContent((String) messageData.get("content"));
            
            ChatMessage saved = chatMessageRepository.save(message);
            
            // Handle attachments (audio, documents, etc.)
            if (messageData.containsKey("attachments") && messageData.get("attachments") instanceof List) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> attachments = (List<Map<String, Object>>) messageData.get("attachments");
                for (Map<String, Object> attData : attachments) {
                    ChatAttachment attachment = new ChatAttachment();
                    attachment.setMessage(saved);
                    attachment.setTitle((String) attData.getOrDefault("title", "Attachment"));
                    
                    // Handle audio: store base64 data in url field (can be improved with file storage later)
                    String url = (String) attData.getOrDefault("url", "");
                    if (url.startsWith("data:audio")) {
                        // Store base64 audio data - in production, save to file system and store file path
                        attachment.setUrl(url);
                    } else {
                        attachment.setUrl(url);
                    }
                    
                    String attType = (String) attData.getOrDefault("type", "LINK");
                    try {
                        ChatAttachment.AttachmentType type = ChatAttachment.AttachmentType.valueOf(attType.toUpperCase());
                        attachment.setType(type);
                    } catch (IllegalArgumentException e) {
                        // Default to AUDIO if type is "audio", otherwise LINK
                        if ("audio".equalsIgnoreCase(attType)) {
                            attachment.setType(ChatAttachment.AttachmentType.AUDIO);
                        } else {
                            attachment.setType(ChatAttachment.AttachmentType.LINK);
                        }
                    }
                    
                    chatAttachmentRepository.save(attachment);
                }
            }
            
            // Update conversation with user message
            Conversation conv = conversation.get();
            conv.setLastMessage(message.getContent());
            conv.setMessagesCount(conv.getMessagesCount() + 1);
            conversationRepository.save(conv);
            
            // 2. Get AI Response (Synchronous for now)
            try {
                String aiResponseText = aiService.getAiResponse(message.getContent());
                
                ChatMessage aiMessage = new ChatMessage();
                aiMessage.setConversation(conv);
                aiMessage.setSender(ChatMessage.MessageSender.AI);
                aiMessage.setContent(aiResponseText);
                
                chatMessageRepository.save(aiMessage);
                
                // Update conversation with AI message
                conv.setLastMessage(aiResponseText);
                conv.setMessagesCount(conv.getMessagesCount() + 1);
                conversationRepository.save(conv);
                
            } catch (Exception e)  {
                e.printStackTrace();
                // Don't fail the whole request if AI fails, just log it
            }
            
            // 3. Analyser les conversations et générer des recommandations IA après 10 messages USER
            // Compter uniquement les messages USER dans la conversation
            List<ChatMessage> allMessages = chatMessageRepository.findByConversationOrderByTimestampAsc(conv);
            long userMessagesCount = allMessages != null ? 
                allMessages.stream().filter(m -> m.getSender() == ChatMessage.MessageSender.USER).count() : 0;
            
            System.out.println("=== ANALYSE IA DES CONVERSATIONS ===");
            System.out.println("Conversation ID: " + conv.getId());
            System.out.println("Total messages: " + conv.getMessagesCount());
            System.out.println("User messages count: " + userMessagesCount);
            
            // Déclencher l'analyse ML après 5 messages USER (seuil réduit pour plus de réactivité)
            if (userMessagesCount >= 5 && (userMessagesCount == 5 || userMessagesCount % 5 == 0)) {
                System.out.println("Déclenchement de l'analyse ML pour l'utilisateur: " + user.getEmail());
                // Analyser les conversations et générer des recommandations de manière asynchrone
                new Thread(() -> {
                    try {
                        System.out.println("Démarrage de l'analyse ML des conversations...");
                        // Utiliser le nouveau service de recommandation basé sur ML
                        var recommendation = formationRecommendationService.generateFormationRecommendation(user);
                        if (recommendation != null) {
                            System.out.println("✅ Recommandation ML générée: " + recommendation.getTitle() + 
                                " - Niveau: " + recommendation.getLevel() + 
                                " - Spécialité: " + recommendation.getSpecialty());
                        } else {
                            System.out.println("ℹ️ Aucune nouvelle recommandation générée (peut-être déjà existante)");
                        }
                    } catch (Exception e) {
                        System.err.println("Erreur lors de l'analyse ML: " + e.getMessage());
                        e.printStackTrace();
                    }
                }).start();
            }
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error sending message", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    @DeleteMapping("/conversations/{conversationId}")
    public ResponseEntity<?> deleteConversation(
            @PathVariable String conversationId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (conversationId == null || conversationId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Conversation ID is required"));
            }
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            Optional<Conversation> conversation = conversationRepository.findById(conversationId);
            if (conversation.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Conversation not found"));
            }
            
            if (!conversation.get().getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "You do not have permission to delete this conversation"));
            }
            
            conversationRepository.delete(conversation.get());
            
            return ResponseEntity.ok(Map.of("message", "Conversation deleted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error deleting conversation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}
