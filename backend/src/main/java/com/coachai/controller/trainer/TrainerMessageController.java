package com.coachai.controller.trainer;

import com.coachai.model.ChatMessage;
import com.coachai.model.Conversation;
import com.coachai.model.User;
import com.coachai.model.UserNotification;
import com.coachai.repository.ChatMessageRepository;
import com.coachai.repository.ConversationRepository;
import com.coachai.repository.UserRepository;
import com.coachai.repository.UserNotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trainer/messages")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerMessageController {
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private ConversationRepository conversationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserNotificationRepository notificationRepository;
    
    @GetMapping
    public ResponseEntity<?> getMessages(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
            
            // Get all conversations with their messages
            // Group messages by conversation and return the latest message from each conversation
            List<Conversation> conversations = conversationRepository.findAll();
            
            List<Map<String, Object>> messagesList = new java.util.ArrayList<>();
            for (Conversation conv : conversations) {
                // Get the latest message from this conversation
                List<ChatMessage> convMessages = chatMessageRepository.findByConversationOrderByTimestampDesc(conv);
                if (!convMessages.isEmpty()) {
                    ChatMessage latestMessage = convMessages.get(0);
                    Map<String, Object> messageMap = new HashMap<>();
                    messageMap.put("id", latestMessage.getId());
                    messageMap.put("conversationId", conv.getId());
                    messageMap.put("content", latestMessage.getContent());
                    messageMap.put("sender", latestMessage.getSender().name());
                    messageMap.put("timestamp", latestMessage.getTimestamp());
                    messageMap.put("read", false); // TODO: Implement read status
                    
                    // Add conversation and user info
                    Map<String, Object> conversationMap = new HashMap<>();
                    conversationMap.put("id", conv.getId());
                    if (conv.getUser() != null) {
                        Map<String, Object> userMap = new HashMap<>();
                        userMap.put("id", conv.getUser().getId());
                        userMap.put("firstName", conv.getUser().getFirstName());
                        userMap.put("lastName", conv.getUser().getLastName());
                        userMap.put("email", conv.getUser().getEmail());
                        userMap.put("role", conv.getUser().getRole().name());
                        conversationMap.put("user", userMap);
                    }
                    messageMap.put("conversation", conversationMap);
                    
                    messagesList.add(messageMap);
                }
            }
            
            return ResponseEntity.ok(messagesList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching messages", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<?> getConversationMessages(
            @PathVariable String conversationId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            Conversation conversation = conversationRepository.findById(conversationId)
                .orElse(null);
            
            if (conversation == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Conversation not found"));
            }
            
            List<ChatMessage> messages = chatMessageRepository.findByConversationOrderByTimestampAsc(conversation);
            
            List<Map<String, Object>> messagesList = new java.util.ArrayList<>();
            for (ChatMessage msg : messages) {
                Map<String, Object> messageMap = new HashMap<>();
                messageMap.put("id", msg.getId());
                messageMap.put("content", msg.getContent());
                messageMap.put("sender", msg.getSender().name());
                messageMap.put("timestamp", msg.getTimestamp());
                messagesList.add(messageMap);
            }
            
            return ResponseEntity.ok(messagesList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching conversation messages", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> sendMessage(
            @RequestBody Map<String, Object> messageData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
            
            String conversationId = (String) messageData.get("conversationId");
            String content = (String) messageData.get("content");
            
            if (conversationId == null || conversationId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Conversation ID is required"));
            }
            
            Conversation conversation = conversationRepository.findById(conversationId)
                .orElse(null);
            
            if (conversation == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Conversation not found"));
            }
            
            ChatMessage message = new ChatMessage();
            message.setConversation(conversation);
            message.setContent(content);
            message.setSender(ChatMessage.MessageSender.AI); // Using AI for trainer messages
            
            ChatMessage saved = chatMessageRepository.save(message);
            
            // Update conversation last message
            conversation.setLastMessage(content);
            conversation.setLastMessageDate(saved.getTimestamp());
            conversation.setMessagesCount((int) chatMessageRepository.countByConversation(conversation));
            conversationRepository.save(conversation);
            
            // Create notification for the user
            if (conversation.getUser() != null) {
                UserNotification notification = new UserNotification();
                notification.setUser(conversation.getUser());
                notification.setType(UserNotification.NotificationType.TRAINER_MESSAGE);
                notification.setTitle("Message de votre formateur");
                notification.setMessage(content);
                notification.setPriority(UserNotification.NotificationPriority.MEDIUM);
                notification.setActionUrl("/user/chat/trainer?conversation=" + conversationId);
                notification.setRead(false);
                notificationRepository.save(notification);
            }
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error sending message", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

