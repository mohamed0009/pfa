package com.coachai.controller.admin;

import com.coachai.model.User;
import com.coachai.model.Formation;
import com.coachai.model.ContentStatus;
import com.coachai.model.FormationEnrollment;
import com.coachai.repository.UserRepository;
import com.coachai.repository.FormationRepository;
import com.coachai.repository.FormationEnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/admin/trainers")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminTrainerController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FormationRepository formationRepository;
    
    @Autowired
    private FormationEnrollmentRepository enrollmentRepository;
    
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
                    .collect(Collectors.toList());
            }
            
            // Enrichir avec les données réelles
            List<Map<String, Object>> enrichedTrainers = trainers.stream().map(trainer -> {
                Map<String, Object> trainerData = new HashMap<>();
                trainerData.put("id", trainer.getId());
                trainerData.put("firstName", trainer.getFirstName());
                trainerData.put("lastName", trainer.getLastName());
                trainerData.put("email", trainer.getEmail());
                trainerData.put("avatarUrl", trainer.getAvatarUrl());
                trainerData.put("bio", trainer.getBio());
                trainerData.put("status", trainer.getStatus().toString());
                trainerData.put("joinedAt", trainer.getJoinedAt());
                trainerData.put("validatedAt", trainer.getValidatedAt());
                
                // Vérifier si le formateur est en ligne (actif dans les 5 dernières minutes)
                boolean isOnline = trainer.getLastActive() != null && 
                    ChronoUnit.MINUTES.between(trainer.getLastActive(), LocalDateTime.now()) <= 5;
                trainerData.put("isOnline", isOnline);
                
                // Formations créées par ce formateur
                List<Formation> trainerFormations = formationRepository.findByCreatedBy(trainer);
                long totalFormations = trainerFormations.size();
                long pendingFormations = trainerFormations.stream()
                    .filter(f -> f.getStatus() == ContentStatus.PENDING)
                    .count();
                long publishedFormations = trainerFormations.stream()
                    .filter(f -> f.getStatus() == ContentStatus.PUBLISHED)
                    .count();
                
                trainerData.put("totalFormations", totalFormations);
                trainerData.put("pendingFormations", pendingFormations);
                trainerData.put("publishedFormations", publishedFormations);
                
                // Liste des formations en attente
                List<Map<String, Object>> pendingFormationsList = trainerFormations.stream()
                    .filter(f -> f.getStatus() == ContentStatus.PENDING)
                    .map(f -> {
                        Map<String, Object> formationData = new HashMap<>();
                        formationData.put("id", f.getId());
                        formationData.put("title", f.getTitle());
                        formationData.put("status", f.getStatus().toString());
                        formationData.put("createdAt", f.getCreatedAt());
                        return formationData;
                    })
                    .collect(Collectors.toList());
                trainerData.put("pendingFormationsList", pendingFormationsList);
                
                // Nombre d'étudiants (inscrits aux formations de ce formateur)
                long studentsCount = enrollmentRepository.findAll().stream()
                    .filter(e -> trainerFormations.contains(e.getFormation()))
                    .map(FormationEnrollment::getUser)
                    .distinct()
                    .count();
                trainerData.put("studentsCount", studentsCount);
                
                // Nombre de cours créés (depuis les formations via les modules)
                // Note: Formation -> Module -> Course (via CourseRepository si nécessaire)
                // Pour l'instant, on utilise le nombre de modules comme approximation
                long coursesCount = trainerFormations.stream()
                    .mapToLong(f -> f.getModules() != null ? f.getModules().size() : 0)
                    .sum();
                trainerData.put("coursesCount", coursesCount);
                
                return trainerData;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(enrichedTrainers);
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
            if (trainer == null || trainer.getRole() != User.UserRole.TRAINER) {
                return ResponseEntity.status(404).body(Map.of("error", "Trainer not found"));
            }
            
            // Enrichir avec les données réelles (même logique que getAllTrainers)
            Map<String, Object> trainerData = new HashMap<>();
            trainerData.put("id", trainer.getId());
            trainerData.put("firstName", trainer.getFirstName());
            trainerData.put("lastName", trainer.getLastName());
            trainerData.put("email", trainer.getEmail());
            trainerData.put("avatarUrl", trainer.getAvatarUrl());
            trainerData.put("bio", trainer.getBio());
            trainerData.put("status", trainer.getStatus().toString());
            trainerData.put("joinedAt", trainer.getJoinedAt());
            trainerData.put("validatedAt", trainer.getValidatedAt());
            
            boolean isOnline = trainer.getLastActive() != null && 
                ChronoUnit.MINUTES.between(trainer.getLastActive(), LocalDateTime.now()) <= 5;
            trainerData.put("isOnline", isOnline);
            
            List<Formation> trainerFormations = formationRepository.findByCreatedBy(trainer);
            trainerData.put("totalFormations", trainerFormations.size());
            trainerData.put("pendingFormations", trainerFormations.stream()
                .filter(f -> f.getStatus() == ContentStatus.PENDING).count());
            trainerData.put("publishedFormations", trainerFormations.stream()
                .filter(f -> f.getStatus() == ContentStatus.PUBLISHED).count());
            
            List<Map<String, Object>> pendingFormationsList = trainerFormations.stream()
                .filter(f -> f.getStatus() == ContentStatus.PENDING)
                .map(f -> {
                    Map<String, Object> formationData = new HashMap<>();
                    formationData.put("id", f.getId());
                    formationData.put("title", f.getTitle());
                    formationData.put("status", f.getStatus().toString());
                    formationData.put("createdAt", f.getCreatedAt());
                    return formationData;
                })
                .collect(Collectors.toList());
            trainerData.put("pendingFormationsList", pendingFormationsList);
            
            long studentsCount = enrollmentRepository.findAll().stream()
                .filter(e -> trainerFormations.contains(e.getFormation()))
                .map(FormationEnrollment::getUser)
                .distinct()
                .count();
            trainerData.put("studentsCount", studentsCount);
            
            long coursesCount = trainerFormations.stream()
                .mapToLong(f -> f.getModules() != null ? f.getModules().size() : 0)
                .sum();
            trainerData.put("coursesCount", coursesCount);
            
            return ResponseEntity.ok(trainerData);
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
    
    /**
     * Récupère les statistiques des formateurs
     * API: GET /api/admin/trainers/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getTrainerStatistics(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            List<User> allTrainers = userRepository.findByRole(User.UserRole.TRAINER);
            
            long total = allTrainers.size();
            long active = allTrainers.stream()
                .filter(t -> t.getStatus() == User.UserStatus.ACTIVE)
                .count();
            long pending = allTrainers.stream()
                .filter(t -> t.getStatus() == User.UserStatus.PENDING)
                .count();
            long suspended = allTrainers.stream()
                .filter(t -> t.getStatus() == User.UserStatus.SUSPENDED)
                .count();
            
            // Formateurs en ligne (actifs dans les 5 dernières minutes)
            long online = allTrainers.stream()
                .filter(t -> t.getLastActive() != null && 
                    ChronoUnit.MINUTES.between(t.getLastActive(), LocalDateTime.now()) <= 5)
                .count();
            
            // Total étudiants (tous les étudiants inscrits aux formations des formateurs)
            long totalStudents = enrollmentRepository.findAll().stream()
                .map(FormationEnrollment::getUser)
                .distinct()
                .count();
            
            // Formations en attente d'approbation
            long pendingFormations = formationRepository.findAll().stream()
                .filter(f -> f.getStatus() == ContentStatus.PENDING)
                .count();
            
            // Note moyenne (placeholder - nécessite un système de rating)
            double averageRating = 4.8;
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("total", total);
            stats.put("active", active);
            stats.put("pending", pending);
            stats.put("suspended", suspended);
            stats.put("online", online);
            stats.put("totalStudents", totalStudents);
            stats.put("pendingFormations", pendingFormations);
            stats.put("averageRating", averageRating);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching trainer statistics", "message", e.getMessage()));
        }
    }
    
    /**
     * Récupère les métriques détaillées d'un formateur
     * API: GET /api/admin/trainers/{id}/metrics
     */
    @GetMapping("/{id}/metrics")
    public ResponseEntity<?> getTrainerMetrics(
            @PathVariable String id,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            User trainer = userRepository.findById(id).orElse(null);
            if (trainer == null || trainer.getRole() != User.UserRole.TRAINER) {
                return ResponseEntity.status(404).body(Map.of("error", "Trainer not found"));
            }
            
            List<Formation> trainerFormations = formationRepository.findByCreatedBy(trainer);
            
            // Étudiants actifs (inscrits aux formations du formateur)
            long studentsActive = enrollmentRepository.findAll().stream()
                .filter(e -> trainerFormations.contains(e.getFormation()))
                .map(FormationEnrollment::getUser)
                .distinct()
                .count();
            
            // Progression moyenne des étudiants
            List<FormationEnrollment> enrollments = enrollmentRepository.findAll().stream()
                .filter(e -> trainerFormations.contains(e.getFormation()))
                .collect(Collectors.toList());
            
            double averageProgress = enrollments.stream()
                .filter(e -> e.getProgress() != null)
                .mapToDouble(e -> e.getProgress().getOverallProgress())
                .average()
                .orElse(0.0);
            
            // Contenu créé
            long contentCreated = trainerFormations.size();
            
            // Contenu en attente
            long contentPending = trainerFormations.stream()
                .filter(f -> f.getStatus() == ContentStatus.PENDING)
                .count();
            
            // Satisfaction étudiante (placeholder)
            double studentSatisfaction = 4.8;
            
            // Temps de réponse moyen (placeholder - nécessite un système de messages)
            double responseTime = 2.3;
            
            Map<String, Object> metrics = new HashMap<>();
            metrics.put("trainerId", trainer.getId());
            metrics.put("studentsActive", studentsActive);
            metrics.put("averageProgress", Math.round(averageProgress));
            metrics.put("contentCreated", contentCreated);
            metrics.put("contentPending", contentPending);
            metrics.put("studentSatisfaction", studentSatisfaction);
            metrics.put("responseTime", responseTime);
            
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching trainer metrics", "message", e.getMessage()));
        }
    }
}

