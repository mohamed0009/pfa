package com.coachai.controller.trainer;

import com.coachai.model.Formation;
import com.coachai.model.User;
import com.coachai.repository.FormationRepository;
import com.coachai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trainer/formations")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerFormationController {
    @Autowired
    private FormationRepository formationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<?> getFormations(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email).orElse(null);
            
            if (trainer == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Trainer not found"));
            }
            
            List<Formation> formations = formationRepository.findByCreatedBy(trainer);
            if (formations == null) {
                formations = List.of();
            }
            return ResponseEntity.ok(formations);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching formations", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getFormation(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Formation ID is required"));
            }
            
            Formation formation = formationRepository.findById(id).orElse(null);
            if (formation == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Formation not found"));
            }
            return ResponseEntity.ok(formation);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching formation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createFormation(
            @RequestBody(required = false) Map<String, Object> formationData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (formationData == null || formationData.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Request body is required"));
            }
            
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email).orElse(null);
            
            if (trainer == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Trainer not found"));
            }
            
            Formation formation = new Formation();
            formation.setCreatedBy(trainer);
            formation.setStatus(com.coachai.model.ContentStatus.DRAFT);
            
            if (formationData.containsKey("title")) {
                formation.setTitle((String) formationData.get("title"));
            }
            if (formationData.containsKey("description")) {
                formation.setDescription((String) formationData.get("description"));
            }
            if (formationData.containsKey("level")) {
                try {
                    formation.setLevel(Formation.Level.valueOf(((String) formationData.get("level")).toUpperCase()));
                } catch (Exception e) {
                    // Invalid level, skip
                }
            }
            if (formationData.containsKey("category")) {
                formation.setCategory((String) formationData.get("category"));
            }
            
            Formation saved = formationRepository.save(formation);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error creating formation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFormation(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> updateData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Formation ID is required"));
            }
            
            if (updateData == null || updateData.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Request body is required"));
            }
            
            Formation formation = formationRepository.findById(id).orElse(null);
            if (formation == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Formation not found"));
            }
            
            if (updateData.containsKey("title")) {
                formation.setTitle((String) updateData.get("title"));
            }
            if (updateData.containsKey("description")) {
                formation.setDescription((String) updateData.get("description"));
            }
            if (updateData.containsKey("level")) {
                try {
                    formation.setLevel(Formation.Level.valueOf(((String) updateData.get("level")).toUpperCase()));
                } catch (Exception e) {
                    // Invalid level, skip
                }
            }
            if (updateData.containsKey("category")) {
                formation.setCategory((String) updateData.get("category"));
            }
            
            Formation saved = formationRepository.save(formation);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error updating formation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFormation(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Formation ID is required"));
            }
            
            if (!formationRepository.existsById(id)) {
                return ResponseEntity.status(404).body(Map.of("error", "Formation not found"));
            }
            
            formationRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error deleting formation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitForValidation(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Formation ID is required"));
            }
            
            Formation formation = formationRepository.findById(id).orElse(null);
            if (formation == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Formation not found"));
            }
            
            formation.setStatus(com.coachai.model.ContentStatus.PENDING);
            formation.setSubmittedForValidationAt(java.time.LocalDateTime.now());
            Formation saved = formationRepository.save(formation);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error submitting formation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}


