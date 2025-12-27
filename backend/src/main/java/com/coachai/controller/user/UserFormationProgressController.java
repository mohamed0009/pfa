package com.coachai.controller.user;

import com.coachai.model.*;
import com.coachai.repository.*;
import com.coachai.service.FormationProgressService;
import com.coachai.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;

/**
 * Controller pour la progression dans les formations
 */
@RestController
@RequestMapping("/api/user/formations/progress")
@CrossOrigin(origins = "http://localhost:4200")
public class UserFormationProgressController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FormationEnrollmentRepository enrollmentRepository;
    
    @Autowired
    private FormationProgressService progressService;
    
    @Autowired
    private CertificateService certificateService;
    
    /**
     * Met à jour la progression d'une leçon (vidéo)
     */
    @PostMapping("/lessons/{lessonId}/watch")
    public ResponseEntity<?> updateLessonProgress(
            @PathVariable String lessonId,
            @RequestBody Map<String, Object> progressData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            String enrollmentId = (String) progressData.get("enrollmentId");
            if (enrollmentId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Enrollment ID is required"));
            }
            
            Double watchPercentage = null;
            if (progressData.get("watchPercentage") instanceof Number) {
                watchPercentage = ((Number) progressData.get("watchPercentage")).doubleValue();
            }
            
            if (watchPercentage == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Watch percentage is required"));
            }
            
            progressService.updateLessonProgress(enrollmentId, lessonId, watchPercentage);
            
            return ResponseEntity.ok(Map.of("message", "Progress updated"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error updating progress", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Vérifie si une leçon peut être accessible
     */
    @GetMapping("/lessons/{lessonId}/can-access")
    public ResponseEntity<?> canAccessLesson(
            @PathVariable String lessonId,
            @RequestParam String enrollmentId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            boolean canAccess = progressService.canAccessLesson(enrollmentId, lessonId);
            
            return ResponseEntity.ok(Map.of("canAccess", canAccess));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error checking access", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Récupère la progression d'une formation
     */
    @GetMapping("/{enrollmentId}")
    public ResponseEntity<?> getProgress(
            @PathVariable String enrollmentId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            FormationEnrollment enrollment = enrollmentRepository.findById(enrollmentId).orElse(null);
            if (enrollment == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Enrollment not found"));
            }
            
            // Vérifier que l'utilisateur est propriétaire
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null || !enrollment.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
            
            return ResponseEntity.ok(enrollment.getProgress());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching progress", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Vérifie si un module peut être accessible (débloqué)
     */
    @GetMapping("/modules/{moduleId}/can-access")
    public ResponseEntity<?> canAccessModule(
            @PathVariable String moduleId,
            @RequestParam String enrollmentId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            boolean canAccess = progressService.canAccessModule(enrollmentId, moduleId);
            
            return ResponseEntity.ok(Map.of("canAccess", canAccess));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error checking module access", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Valide un module (contenu terminé + quiz réussi)
     * Règle Coursera: Module validé = toutes les leçons terminées + quiz réussi (≥60%)
     */
    @PostMapping("/modules/{moduleId}/validate")
    public ResponseEntity<?> validateModule(
            @PathVariable String moduleId,
            @RequestParam String enrollmentId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            FormationEnrollment enrollment = enrollmentRepository.findById(enrollmentId).orElse(null);
            if (enrollment == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Enrollment not found"));
            }
            
            // Vérifier que l'utilisateur est propriétaire
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null || !enrollment.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
            
            boolean isValidated = progressService.validateModule(enrollmentId, moduleId);
            
            if (isValidated) {
                return ResponseEntity.ok(Map.of(
                    "message", "Module validé avec succès",
                    "validated", true
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Le module ne peut pas être validé. Vérifiez que toutes les leçons sont terminées et que les quiz sont réussi (≥60%)",
                    "validated", false
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error validating module", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Génère le certificat si tous les modules sont validés
     */
    @PostMapping("/{enrollmentId}/certificate")
    public ResponseEntity<?> generateCertificate(
            @PathVariable String enrollmentId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            FormationEnrollment enrollment = enrollmentRepository.findById(enrollmentId).orElse(null);
            if (enrollment == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Enrollment not found"));
            }
            
            // Vérifier que l'utilisateur est propriétaire
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null || !enrollment.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
            
            Certificate certificate = certificateService.generateCertificate(enrollmentId);
            
            return ResponseEntity.ok(certificate);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error generating certificate", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    /**
     * Récupère tous les certificats de formation de l'utilisateur
     */
    @GetMapping("/certificates")
    public ResponseEntity<?> getMyCertificates(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            List<Certificate> certificates = certificateService.getUserFormationCertificates(user);
            
            // Mapper les certificats pour le frontend
            List<Map<String, Object>> certificatesData = new ArrayList<>();
            for (Certificate cert : certificates) {
                Map<String, Object> certData = new HashMap<>();
                certData.put("id", cert.getId());
                certData.put("certificateNumber", cert.getCertificateNumber());
                certData.put("certificateUrl", cert.getCertificateUrl());
                certData.put("issuedAt", cert.getIssuedAt());
                certData.put("formationTitle", cert.getFormation() != null ? cert.getFormation().getTitle() : "");
                certData.put("formationId", cert.getFormation() != null ? cert.getFormation().getId() : "");
                certificatesData.add(certData);
            }
            
            return ResponseEntity.ok(certificatesData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching certificates", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

