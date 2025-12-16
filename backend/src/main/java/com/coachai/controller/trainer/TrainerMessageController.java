package com.coachai.controller.trainer;

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
    
    @GetMapping
    public ResponseEntity<List<ChatMessage>> getMessages(Authentication authentication) {
        String email = authentication.getName();
        User trainer = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Trainer not found"));
        
        // Get all messages where trainer is involved
        List<ChatMessage> messages = chatMessageRepository.findAll();
        return ResponseEntity.ok(messages);
    }
    
    @PostMapping
    public ResponseEntity<ChatMessage> sendMessage(
            @RequestBody Map<String, Object> messageData,
            Authentication authentication) {
        String email = authentication.getName();
        User trainer = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Trainer not found"));
        
        String conversationId = (String) messageData.get("conversationId");
        String content = (String) messageData.get("content");
        
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        ChatMessage message = new ChatMessage();
        message.setConversation(conversation);
        message.setContent(content);
        message.setSender(ChatMessage.MessageSender.AI); // Using AI for trainer messages
        
        ChatMessage saved = chatMessageRepository.save(message);
        return ResponseEntity.ok(saved);
    }
}

