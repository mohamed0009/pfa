package com.coachai.controller.admin;

import com.coachai.model.ContentStatus;
import com.coachai.model.Formation;
import com.coachai.model.Course;
import com.coachai.repository.FormationRepository;
import com.coachai.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/content")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminContentController {
    @Autowired
    private FormationRepository formationRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingContent(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            List<Formation> pendingFormations = formationRepository.findByStatus(ContentStatus.PENDING);
            List<Course> pendingCourses = courseRepository.findByStatus(ContentStatus.PENDING);
            
            if (pendingFormations == null) {
                pendingFormations = List.of();
            }
            if (pendingCourses == null) {
                pendingCourses = List.of();
            }
            
            return ResponseEntity.ok(Map.of(
                "formations", pendingFormations,
                "courses", pendingCourses
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching pending content", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping("/formations/{id}/approve")
    public ResponseEntity<?> approveFormation(@PathVariable String id, Authentication authentication) {
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
            
            formation.setStatus(ContentStatus.APPROVED);
            formation.setValidatedAt(java.time.LocalDateTime.now());
            Formation saved = formationRepository.save(formation);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error approving formation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping("/formations/{id}/reject")
    public ResponseEntity<?> rejectFormation(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> reasonData,
            Authentication authentication) {
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
            
            String reason = reasonData != null && reasonData.containsKey("reason") 
                ? (String) reasonData.get("reason") 
                : "Rejected by admin";
            
            formation.setStatus(ContentStatus.REJECTED);
            formation.setRejectionReason(reason);
            Formation saved = formationRepository.save(formation);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error rejecting formation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}


