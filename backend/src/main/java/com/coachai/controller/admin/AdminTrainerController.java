package com.coachai.controller.admin;

import com.coachai.model.User;
import com.coachai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/trainers")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminTrainerController {
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<?> getAllTrainers(
            @RequestParam(required = false) String status,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            List<User> trainers = userRepository.findByRole(User.UserRole.TRAINER);
            
            if (trainers == null) {
                trainers = List.of();
            }
            
            if (status != null) {
                trainers = trainers.stream()
                    .filter(t -> t.getStatus().name().equalsIgnoreCase(status))
                    .toList();
            }
            
            trainers.forEach(t -> t.setPassword(null));
            
            return ResponseEntity.ok(trainers);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching trainers", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getTrainer(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Trainer ID is required"));
            }
            
            User trainer = userRepository.findById(id).orElse(null);
            if (trainer == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Trainer not found"));
            }
            
            trainer.setPassword(null);
            return ResponseEntity.ok(trainer);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching trainer", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping("/{id}/validate")
    public ResponseEntity<?> validateTrainer(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Trainer ID is required"));
            }
            
            User trainer = userRepository.findById(id).orElse(null);
            if (trainer == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Trainer not found"));
            }
            
            trainer.setStatus(User.UserStatus.ACTIVE);
            trainer.setValidatedAt(LocalDateTime.now());
            User saved = userRepository.save(trainer);
            saved.setPassword(null);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error validating trainer", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping("/{id}/suspend")
    public ResponseEntity<?> suspendTrainer(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Trainer ID is required"));
            }
            
            User trainer = userRepository.findById(id).orElse(null);
            if (trainer == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Trainer not found"));
            }
            
            trainer.setStatus(User.UserStatus.SUSPENDED);
            User saved = userRepository.save(trainer);
            saved.setPassword(null);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error suspending trainer", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrainer(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Trainer ID is required"));
            }
            
            if (!userRepository.existsById(id)) {
                return ResponseEntity.status(404).body(Map.of("error", "Trainer not found"));
            }
            
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error deleting trainer", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

