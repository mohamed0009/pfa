package com.coachai.controller.admin;

import com.coachai.model.User;
import com.coachai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/profile")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminProfileController {
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            String email = authentication.getName();
            User admin = userRepository.findByEmail(email).orElse(null);
            if (admin == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Admin not found"));
            }
            
            admin.setPassword(null);
            return ResponseEntity.ok(admin);
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
            User admin = userRepository.findByEmail(email).orElse(null);
            if (admin == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Admin not found"));
            }
            
            if (updateData.containsKey("firstName")) {
                admin.setFirstName((String) updateData.get("firstName"));
            }
            if (updateData.containsKey("lastName")) {
                admin.setLastName((String) updateData.get("lastName"));
            }
            if (updateData.containsKey("avatarUrl")) {
                admin.setAvatarUrl((String) updateData.get("avatarUrl"));
            }
            if (updateData.containsKey("phone")) {
                admin.setPhone((String) updateData.get("phone"));
            }
            if (updateData.containsKey("bio")) {
                admin.setBio((String) updateData.get("bio"));
            }
            
            User saved = userRepository.save(admin);
            saved.setPassword(null);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error updating profile", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

