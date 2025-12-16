package com.coachai.controller.user;

import com.coachai.model.User;
import com.coachai.model.UserNotification;
import com.coachai.repository.UserRepository;
import com.coachai.repository.UserNotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/notifications")
@CrossOrigin(origins = "http://localhost:4200")
public class UserNotificationController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserNotificationRepository notificationRepository;
    
    @GetMapping
    public ResponseEntity<?> getNotifications(Authentication authentication) {
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
            
            List<UserNotification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
            if (notifications == null) {
                notifications = List.of();
            }
            
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching notifications", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable String id,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Notification ID is required"));
            }
            
            UserNotification notification = notificationRepository.findById(id)
                .orElse(null);
            
            if (notification == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Notification not found"));
            }
            
            notification.setRead(true);
            notification.setReadAt(java.time.LocalDateTime.now());
            UserNotification saved = notificationRepository.save(notification);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error updating notification", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/unread/count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
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
            
            long count = notificationRepository.countByUserAndIsReadFalse(user);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching unread count", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

