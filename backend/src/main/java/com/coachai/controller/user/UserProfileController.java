package com.coachai.controller.user;

import com.coachai.model.User;
import com.coachai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user/profile")
@CrossOrigin(origins = "http://localhost:4200")
public class UserProfileController {
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized", "message", "Authentication required"));
            }
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found", "email", email));
            }
            
            // Remove sensitive information
            user.setPassword(null);
            
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching profile", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PutMapping
    public ResponseEntity<?> updateProfile(
            @RequestBody(required = false) Map<String, Object> updateData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (updateData == null || updateData.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Request body is required"));
            }
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            // Update only provided fields
            if (updateData.containsKey("firstName")) {
                user.setFirstName((String) updateData.get("firstName"));
            }
            if (updateData.containsKey("lastName")) {
                user.setLastName((String) updateData.get("lastName"));
            }
            if (updateData.containsKey("formation")) {
                user.setFormation((String) updateData.get("formation"));
            }
            if (updateData.containsKey("niveau")) {
                String niveauStr = (String) updateData.get("niveau");
                if (niveauStr != null) {
                    try {
                        user.setNiveau(User.Level.valueOf(niveauStr.toUpperCase()));
                    } catch (IllegalArgumentException e) {
                        // Invalid level, skip
                    }
                }
            }
            if (updateData.containsKey("avatarUrl")) {
                user.setAvatarUrl((String) updateData.get("avatarUrl"));
            }
            
            User saved = userRepository.save(user);
            saved.setPassword(null); // Remove password from response
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error updating profile", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}


