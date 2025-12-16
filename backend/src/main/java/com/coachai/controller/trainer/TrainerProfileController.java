package com.coachai.controller.trainer;

import com.coachai.model.User;
import com.coachai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trainer/profile")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerProfileController {
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(java.util.Map.of("error", "Unauthorized"));
            }
            
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email).orElse(null);
            if (trainer == null) {
                return ResponseEntity.status(404).body(java.util.Map.of("error", "Trainer not found"));
            }
            
            trainer.setPassword(null);
            return ResponseEntity.ok(trainer);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error fetching profile", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PutMapping
    public ResponseEntity<?> updateProfile(
            @RequestBody(required = false) java.util.Map<String, Object> updateData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(java.util.Map.of("error", "Unauthorized"));
            }
            
            if (updateData == null || updateData.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Request body is required"));
            }
            
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email).orElse(null);
            if (trainer == null) {
                return ResponseEntity.status(404).body(java.util.Map.of("error", "Trainer not found"));
            }
            
            if (updateData.containsKey("firstName")) {
                trainer.setFirstName((String) updateData.get("firstName"));
            }
            if (updateData.containsKey("lastName")) {
                trainer.setLastName((String) updateData.get("lastName"));
            }
            if (updateData.containsKey("avatarUrl")) {
                trainer.setAvatarUrl((String) updateData.get("avatarUrl"));
            }
            if (updateData.containsKey("phone")) {
                trainer.setPhone((String) updateData.get("phone"));
            }
            if (updateData.containsKey("bio")) {
                trainer.setBio((String) updateData.get("bio"));
            }
            
            User saved = userRepository.save(trainer);
            saved.setPassword(null);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error updating profile", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

