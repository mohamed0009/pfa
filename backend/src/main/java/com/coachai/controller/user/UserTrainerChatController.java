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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/trainer-chat")
@CrossOrigin(origins = "http://localhost:4200")
public class UserTrainerChatController {
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private ConversationRepository conversationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Get all conversations between the authenticated user and trainers
     */
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
            
            // Get all conversations for this user
            List<Conversation> conversations = conversationRepository.findByUserOrderByLastMessageDateDesc(user);
            
            List<Map<String, Object>> conversationsList = new ArrayList<>();
            for (Conversation conv : conversations) {
                Map<String, Object> convMap = new HashMap<>();
                convMap.put("id", conv.getId());
                convMap.put("title", conv.getTitle());
                convMap.put("lastMessage", conv.getLastMessage());
                convMap.put("lastMessageDate", conv.getLastMessageDate());
                convMap.put("messagesCount", conv.getMessagesCount());
                conversationsList.add(convMap);
            }
            
            return ResponseEntity.ok(conversationsList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching conversations", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Get messages for a specific conversation
     */
    @GetMapping("/conversation/{conversationId}/messages")
    public ResponseEntity<?> getConversationMessages(
            @PathVariable String conversationId,
            Authentication authentication) {
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
            
            Conversation conversation = conversationRepository.findById(conversationId)
                .orElse(null);
            
            if (conversation == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Conversation not found"));
            }
            
            // Verify that the conversation belongs to the authenticated user
            if (!conversation.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
            
            List<ChatMessage> messages = chatMessageRepository.findByConversationOrderByTimestampAsc(conversation);
            
            List<Map<String, Object>> messagesList = new ArrayList<>();
            for (ChatMessage msg : messages) {
                Map<String, Object> messageMap = new HashMap<>();
                messageMap.put("id", msg.getId());
                messageMap.put("content", msg.getContent());
                messageMap.put("sender", msg.getSender().name());
                messageMap.put("timestamp", msg.getTimestamp());
                messageMap.put("read", msg.isRead());
                messagesList.add(messageMap);
            }
            
            return ResponseEntity.ok(messagesList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching messages", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Send a message from user to trainer
     */
    @PostMapping("/conversation/{conversationId}/message")
    public ResponseEntity<?> sendMessage(
            @PathVariable String conversationId,
            @RequestBody Map<String, Object> messageData,
            Authentication authentication) {
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
            
            String content = (String) messageData.get("content");
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message content is required"));
            }
            
            Conversation conversation = conversationRepository.findById(conversationId)
                .orElse(null);
            
            if (conversation == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Conversation not found"));
            }
            
            // Verify that the conversation belongs to the authenticated user
            if (!conversation.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
            
            ChatMessage message = new ChatMessage();
            message.setConversation(conversation);
            message.setContent(content);
            message.setSender(ChatMessage.MessageSender.USER);
            message.setRead(false);
            
            ChatMessage saved = chatMessageRepository.save(message);
            
            // Update conversation last message
            conversation.setLastMessage(content);
            conversation.setLastMessageDate(saved.getTimestamp());
            conversation.setMessagesCount((int) chatMessageRepository.countByConversation(conversation));
            conversationRepository.save(conversation);
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error sending message", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Create a new conversation with a trainer
     */
    @PostMapping("/conversation")
    public ResponseEntity<?> createConversation(
            @RequestBody Map<String, Object> conversationData,
            Authentication authentication) {
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
            
            String title = (String) conversationData.get("title");
            if (title == null || title.trim().isEmpty()) {
                title = "Conversation avec formateur";
            }
            
            Conversation conversation = new Conversation();
            conversation.setUser(user);
            conversation.setTitle(title);
            conversation.setActive(true);
            conversation.setMessagesCount(0);
            
            Conversation saved = conversationRepository.save(conversation);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", saved.getId());
            response.put("title", saved.getTitle());
            response.put("lastMessage", saved.getLastMessage());
            response.put("lastMessageDate", saved.getLastMessageDate());
            response.put("messagesCount", saved.getMessagesCount());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error creating conversation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

