package com.coachai.controller.user;

import com.coachai.model.ChatMessage;
import com.coachai.model.Conversation;
import com.coachai.model.User;
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
<<<<<<< HEAD
    private com.coachai.service.AiService aiService;

    @Autowired
=======
>>>>>>> 6cda151b2eff42f2d8a1da1f1935bfdc111bbe6d
    private UserRepository userRepository;
    
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
            
            return ResponseEntity.ok(messages);
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
            
<<<<<<< HEAD
            // 1. Save User Message
=======
>>>>>>> 6cda151b2eff42f2d8a1da1f1935bfdc111bbe6d
            ChatMessage message = new ChatMessage();
            message.setConversation(conversation.get());
            message.setSender(ChatMessage.MessageSender.USER);
            message.setContent((String) messageData.get("content"));
            
            ChatMessage saved = chatMessageRepository.save(message);
            
<<<<<<< HEAD
            // Update conversation with user message
=======
            // Update conversation
>>>>>>> 6cda151b2eff42f2d8a1da1f1935bfdc111bbe6d
            Conversation conv = conversation.get();
            conv.setLastMessage(message.getContent());
            conv.setMessagesCount(conv.getMessagesCount() + 1);
            conversationRepository.save(conv);
            
<<<<<<< HEAD
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
            
            
=======
>>>>>>> 6cda151b2eff42f2d8a1da1f1935bfdc111bbe6d
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error sending message", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
<<<<<<< HEAD

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
=======
>>>>>>> 6cda151b2eff42f2d8a1da1f1935bfdc111bbe6d
}

