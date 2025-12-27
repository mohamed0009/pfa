package com.coachai.controller.admin;

import com.coachai.model.UserNotification;
import com.coachai.repository.UserNotificationRepository;
import com.coachai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/notifications")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminNotificationsController {
    @Autowired
    private UserNotificationRepository userNotificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<?> getAllNotifications(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String status,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            List<UserNotification> notifications = userNotificationRepository.findAll();
            
            // Filter by type
            if (type != null && !type.isEmpty()) {
                try {
                    UserNotification.NotificationType typeEnum = UserNotification.NotificationType.valueOf(type.toUpperCase());
                    notifications = notifications.stream()
                        .filter(n -> n.getType() == typeEnum)
                        .collect(Collectors.toList());
                } catch (IllegalArgumentException e) {
                    // Invalid type, ignore filter
                }
            }
            
            // Filter by priority
            if (priority != null && !priority.isEmpty()) {
                try {
                    UserNotification.NotificationPriority priorityEnum = UserNotification.NotificationPriority.valueOf(priority.toUpperCase());
                    notifications = notifications.stream()
                        .filter(n -> n.getPriority() == priorityEnum)
                        .collect(Collectors.toList());
                } catch (IllegalArgumentException e) {
                    // Invalid priority, ignore filter
                }
            }
            
            // Map to admin format
            List<Map<String, Object>> notificationsData = new ArrayList<>();
            for (UserNotification notif : notifications) {
                // Count recipients and read count
                long totalRecipients = 1; // Default, would need to calculate from target audience
                long readCount = notif.getReadAt() != null ? 1 : 0;
                
                Map<String, Object> notifData = new HashMap<>();
                notifData.put("id", notif.getId());
                notifData.put("type", notif.getType() != null ? notif.getType().toString().toLowerCase() : "info");
                notifData.put("priority", notif.getPriority() != null ? notif.getPriority().toString().toLowerCase() : "medium");
                notifData.put("title", notif.getTitle() != null ? notif.getTitle() : "");
                notifData.put("message", notif.getMessage() != null ? notif.getMessage() : "");
                notifData.put("targetAudience", "specific"); // Would need to determine from notification settings
                notifData.put("targetUserIds", notif.getUser() != null ? List.of(notif.getUser().getId()) : List.of());
                notifData.put("status", "sent");
                notifData.put("isRead", notif.getReadAt() != null);
                notifData.put("createdBy", "system");
                notifData.put("createdAt", notif.getCreatedAt() != null ? notif.getCreatedAt() : new Date());
                notifData.put("sentAt", notif.getCreatedAt() != null ? notif.getCreatedAt() : new Date());
                notifData.put("totalRecipients", totalRecipients);
                notifData.put("readCount", readCount);
                notificationsData.add(notifData);
            }
            
            return ResponseEntity.ok(notificationsData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching notifications", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createNotification(
            @RequestBody Map<String, Object> notificationData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            String title = (String) notificationData.get("title");
            String message = (String) notificationData.get("message");
            String type = (String) notificationData.getOrDefault("type", "REMINDER");
            String priority = (String) notificationData.getOrDefault("priority", "MEDIUM");
            String targetAudience = (String) notificationData.getOrDefault("targetAudience", "all");
            String actionUrl = (String) notificationData.getOrDefault("actionUrl", null);
            
            if (title == null || title.trim().isEmpty() || message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Title and message are required"));
            }
            
            // Get users based on target audience
            List<com.coachai.model.User> targetUsers = new ArrayList<>();
            
            // Si des utilisateurs spécifiques sont fournis
            if (notificationData.containsKey("targetUserIds") && notificationData.get("targetUserIds") instanceof List) {
                @SuppressWarnings("unchecked")
                List<String> userIds = (List<String>) notificationData.get("targetUserIds");
                for (String userId : userIds) {
                    userRepository.findById(userId).ifPresent(targetUsers::add);
                }
            } else if ("all".equals(targetAudience)) {
                targetUsers = userRepository.findAll();
            } else if ("apprenants".equals(targetAudience) || "apprenant".equals(targetAudience)) {
                targetUsers = userRepository.findByRole(com.coachai.model.User.UserRole.USER);
            } else if ("formateurs".equals(targetAudience) || "formateur".equals(targetAudience)) {
                targetUsers = userRepository.findByRole(com.coachai.model.User.UserRole.TRAINER);
            } else if ("administrateurs".equals(targetAudience) || "administrateur".equals(targetAudience)) {
                targetUsers = userRepository.findByRole(com.coachai.model.User.UserRole.ADMIN);
            }
            
            if (targetUsers.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No target users found"));
            }
            
            // Create notifications for all target users
            List<UserNotification> createdNotifications = new ArrayList<>();
            for (com.coachai.model.User user : targetUsers) {
                UserNotification notification = new UserNotification();
                notification.setUser(user);
                notification.setTitle(title);
                notification.setMessage(message);
                
                try {
                    notification.setType(UserNotification.NotificationType.valueOf(type.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    notification.setType(UserNotification.NotificationType.REMINDER);
                }
                
                try {
                    notification.setPriority(UserNotification.NotificationPriority.valueOf(priority.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    notification.setPriority(UserNotification.NotificationPriority.MEDIUM);
                }
                
                if (actionUrl != null && !actionUrl.trim().isEmpty()) {
                    notification.setActionUrl(actionUrl);
                }
                
                // Marquer que la notification vient de l'admin
                notification.setCreatedBy("admin");
                notification.setRead(false);
                createdNotifications.add(userNotificationRepository.save(notification));
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Notification created successfully",
                "id", UUID.randomUUID().toString(),
                "totalRecipients", createdNotifications.size()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error creating notification", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Recherche des utilisateurs/formateurs par nom ou email
     * API: GET /api/admin/notifications/search-users?query=...
     */
    @GetMapping("/search-users")
    public ResponseEntity<?> searchUsers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String role,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            List<com.coachai.model.User> users;
            
            // Filtrer par rôle si spécifié
            if (role != null && !role.isEmpty()) {
                try {
                    com.coachai.model.User.UserRole roleEnum = com.coachai.model.User.UserRole.valueOf(role.toUpperCase());
                    users = userRepository.findByRole(roleEnum);
                } catch (IllegalArgumentException e) {
                    users = userRepository.findAll();
                }
            } else {
                users = userRepository.findAll();
            }
            
            // Filtrer par query (nom, prénom, email)
            if (query != null && !query.trim().isEmpty()) {
                String queryLower = query.toLowerCase().trim();
                users = users.stream()
                    .filter(user -> {
                        String firstName = user.getFirstName() != null ? user.getFirstName().toLowerCase() : "";
                        String lastName = user.getLastName() != null ? user.getLastName().toLowerCase() : "";
                        String email = user.getEmail() != null ? user.getEmail().toLowerCase() : "";
                        String fullName = (firstName + " " + lastName).trim();
                        return firstName.contains(queryLower) || 
                               lastName.contains(queryLower) || 
                               fullName.contains(queryLower) ||
                               email.contains(queryLower);
                    })
                    .collect(Collectors.toList());
            }
            
            // Limiter à 50 résultats
            users = users.stream().limit(50).collect(Collectors.toList());
            
            // Mapper les résultats
            List<Map<String, Object>> usersData = new ArrayList<>();
            for (com.coachai.model.User user : users) {
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", user.getId());
                userData.put("firstName", user.getFirstName());
                userData.put("lastName", user.getLastName());
                userData.put("email", user.getEmail());
                userData.put("fullName", (user.getFirstName() != null ? user.getFirstName() : "") + " " + (user.getLastName() != null ? user.getLastName() : "").trim());
                userData.put("role", user.getRole() != null ? user.getRole().toString() : "");
                userData.put("avatarUrl", user.getAvatarUrl());
                usersData.add(userData);
            }
            
            return ResponseEntity.ok(usersData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error searching users", "message", e.getMessage()));
        }
    }
    
    /**
     * Récupère les statistiques des notifications
     * API: GET /api/admin/notifications/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getNotificationStats(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            List<UserNotification> allNotifications = userNotificationRepository.findAll();
            
            long total = allNotifications.size();
            long read = allNotifications.stream().filter(n -> n.getReadAt() != null).count();
            long unread = total - read;
            double readRate = total > 0 ? (double) read / total * 100 : 0;
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("total", total);
            stats.put("sent", total); // Toutes les notifications sont considérées comme envoyées
            stats.put("scheduled", 0); // Pas de système de planification pour l'instant
            stats.put("read", read);
            stats.put("unread", unread);
            stats.put("readRate", Math.round(readRate * 100) / 100.0);
            stats.put("activeRules", 0); // Pas de règles automatiques pour l'instant
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching notification stats", "message", e.getMessage()));
        }
    }
}

