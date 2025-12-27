package com.coachai.controller.trainer;

import com.coachai.model.User;
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
@RequestMapping("/api/trainer/alerts")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerAlertController {
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<?> getAlerts(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            // For now, return empty list as alerts are not yet fully implemented
            // This can be extended to return actual alerts (e.g., pending reviews, at-risk students, etc.)
            List<Map<String, Object>> alerts = new ArrayList<>();
            
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching alerts", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAlertAsRead(
            @PathVariable String id,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            // TODO: Implement alert read marking
            return ResponseEntity.ok(Map.of("message", "Alert marked as read"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error marking alert as read", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

