package com.coachai.controller.admin;

import com.coachai.model.*;
import com.coachai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller Admin pour gérer les formations et voir toutes les inscriptions
 */
@RestController
@RequestMapping("/api/admin/formations")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminFormationController {
    
    @Autowired
    private FormationRepository formationRepository;
    
    @Autowired
    private FormationEnrollmentRepository enrollmentRepository;
    
    @Autowired
    private FormationProgressRepository progressRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ModuleRepository moduleRepository;
    
    @Autowired
    private FormationModuleProgressRepository moduleProgressRepository;
    
    @Autowired
    private UserNotificationRepository notificationRepository;
    
    /**
     * Récupère toutes les formations
     */
    @GetMapping
    public ResponseEntity<?> getAllFormations(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            List<Formation> formations = formationRepository.findAll();
            return ResponseEntity.ok(formations);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching formations", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Récupère toutes les inscriptions par formation
     */
    @GetMapping("/enrollments")
    public ResponseEntity<?> getAllEnrollments(
            @RequestParam(required = false) String formationId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            List<FormationEnrollment> enrollments;
            if (formationId != null) {
                Formation formation = formationRepository.findById(formationId).orElse(null);
                if (formation == null) {
                    return ResponseEntity.status(404).body(Map.of("error", "Formation not found"));
                }
                enrollments = enrollmentRepository.findByFormation(formation);
            } else {
                enrollments = enrollmentRepository.findAll();
            }
            
            List<Map<String, Object>> enrollmentsData = new ArrayList<>();
            
            for (FormationEnrollment enrollment : enrollments) {
                Map<String, Object> enrollmentData = new HashMap<>();
                enrollmentData.put("enrollmentId", enrollment.getId());
                enrollmentData.put("formationId", enrollment.getFormation().getId());
                enrollmentData.put("formationTitle", enrollment.getFormation().getTitle());
                enrollmentData.put("studentId", enrollment.getUser().getId());
                enrollmentData.put("studentName", (enrollment.getUser().getFirstName() != null ? enrollment.getUser().getFirstName() : "") + 
                    " " + (enrollment.getUser().getLastName() != null ? enrollment.getUser().getLastName() : ""));
                enrollmentData.put("studentEmail", enrollment.getUser().getEmail());
                enrollmentData.put("enrolledAt", enrollment.getEnrolledAt());
                enrollmentData.put("status", enrollment.getStatus().toString());
                
                FormationProgress progress = enrollment.getProgress();
                if (progress != null) {
                    enrollmentData.put("overallProgress", progress.getOverallProgress());
                    enrollmentData.put("completedModules", progress.getCompletedModules());
                    enrollmentData.put("totalModules", progress.getTotalModules());
                    enrollmentData.put("completedLessons", progress.getCompletedLessons());
                    enrollmentData.put("totalLessons", progress.getTotalLessons());
                    enrollmentData.put("averageQuizScore", progress.getAverageQuizScore());
                }
                
                enrollmentsData.add(enrollmentData);
            }
            
            return ResponseEntity.ok(enrollmentsData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching enrollments", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Récupère les statistiques globales par formation
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getFormationStats(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            List<Formation> formations = formationRepository.findAll();
            List<Map<String, Object>> stats = new ArrayList<>();
            
            for (Formation formation : formations) {
                List<FormationEnrollment> enrollments = enrollmentRepository.findByFormation(formation);
                
                int totalStudents = enrollments.size();
                double averageProgress = 0.0;
                int completedCount = 0;
                
                for (FormationEnrollment enrollment : enrollments) {
                    if (enrollment.getProgress() != null) {
                        averageProgress += enrollment.getProgress().getOverallProgress();
                        if (enrollment.getStatus() == FormationEnrollment.EnrollmentStatus.COMPLETED) {
                            completedCount++;
                        }
                    }
                }
                
                if (totalStudents > 0) {
                    averageProgress = averageProgress / totalStudents;
                }
                
                Map<String, Object> formationStats = new HashMap<>();
                formationStats.put("formationId", formation.getId());
                formationStats.put("formationTitle", formation.getTitle());
                formationStats.put("totalStudents", totalStudents);
                formationStats.put("averageProgress", averageProgress);
                formationStats.put("completedCount", completedCount);
                formationStats.put("status", formation.getStatus().toString());
                
                stats.add(formationStats);
            }
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching stats", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Active ou désactive une formation
     */
    @PutMapping("/{formationId}/toggle")
    public ResponseEntity<?> toggleFormation(
            @PathVariable String formationId,
            @RequestParam(required = false) Boolean enabled,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            Formation formation = formationRepository.findById(formationId).orElse(null);
            if (formation == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Formation not found"));
            }
            
            if (enabled != null) {
                if (enabled && formation.getStatus() == ContentStatus.PUBLISHED) {
                    // Déjà activée
                    return ResponseEntity.ok(Map.of("message", "Formation already enabled", "status", formation.getStatus()));
                } else if (!enabled && formation.getStatus() != ContentStatus.PUBLISHED) {
                    // Déjà désactivée
                    return ResponseEntity.ok(Map.of("message", "Formation already disabled", "status", formation.getStatus()));
                }
                
                if (enabled) {
                    formation.setStatus(ContentStatus.PUBLISHED);
                } else {
                    formation.setStatus(ContentStatus.ARCHIVED);
                }
            } else {
                // Toggle
                if (formation.getStatus() == ContentStatus.PUBLISHED) {
                    formation.setStatus(ContentStatus.ARCHIVED);
                } else if (formation.getStatus() == ContentStatus.ARCHIVED) {
                    formation.setStatus(ContentStatus.PUBLISHED);
                }
            }
            
            Formation saved = formationRepository.save(formation);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error toggling formation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Récupère les inscriptions d'une formation spécifique
     * API: GET /api/admin/formations/{id}/inscriptions
     */
    @GetMapping("/{formationId}/inscriptions")
    public ResponseEntity<?> getFormationInscriptions(
            @PathVariable String formationId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            Formation formation = formationRepository.findById(formationId).orElse(null);
            if (formation == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Formation not found"));
            }
            
            List<FormationEnrollment> enrollments = enrollmentRepository.findByFormation(formation);
            List<Map<String, Object>> enrollmentsData = new ArrayList<>();
            
            for (FormationEnrollment enrollment : enrollments) {
                Map<String, Object> enrollmentData = new HashMap<>();
                enrollmentData.put("enrollmentId", enrollment.getId());
                enrollmentData.put("studentId", enrollment.getUser().getId());
                enrollmentData.put("studentName", (enrollment.getUser().getFirstName() != null ? enrollment.getUser().getFirstName() : "") + 
                    " " + (enrollment.getUser().getLastName() != null ? enrollment.getUser().getLastName() : ""));
                enrollmentData.put("studentEmail", enrollment.getUser().getEmail());
                enrollmentData.put("enrolledAt", enrollment.getEnrolledAt());
                enrollmentData.put("status", enrollment.getStatus().toString());
                
                FormationProgress progress = enrollment.getProgress();
                if (progress != null) {
                    enrollmentData.put("overallProgress", progress.getOverallProgress());
                    enrollmentData.put("completedModules", progress.getCompletedModules());
                    enrollmentData.put("totalModules", progress.getTotalModules());
                    enrollmentData.put("averageQuizScore", progress.getAverageQuizScore());
                }
                
                enrollmentsData.add(enrollmentData);
            }
            
            return ResponseEntity.ok(enrollmentsData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching inscriptions", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Récupère la progression des étudiants pour une formation
     * API: GET /api/admin/formations/{id}/progression
     */
    @GetMapping("/{formationId}/progression")
    public ResponseEntity<?> getFormationProgression(
            @PathVariable String formationId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            Formation formation = formationRepository.findById(formationId).orElse(null);
            if (formation == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Formation not found"));
            }
            
            List<FormationEnrollment> enrollments = enrollmentRepository.findByFormation(formation);
            List<Map<String, Object>> progressionData = new ArrayList<>();
            
            for (FormationEnrollment enrollment : enrollments) {
                FormationProgress progress = enrollment.getProgress();
                if (progress == null) continue;
                
                Map<String, Object> studentProgress = new HashMap<>();
                studentProgress.put("studentId", enrollment.getUser().getId());
                studentProgress.put("studentName", (enrollment.getUser().getFirstName() != null ? enrollment.getUser().getFirstName() : "") + 
                    " " + (enrollment.getUser().getLastName() != null ? enrollment.getUser().getLastName() : ""));
                studentProgress.put("overallProgress", progress.getOverallProgress());
                studentProgress.put("completedModules", progress.getCompletedModules());
                studentProgress.put("totalModules", progress.getTotalModules());
                studentProgress.put("completedLessons", progress.getCompletedLessons());
                studentProgress.put("totalLessons", progress.getTotalLessons());
                studentProgress.put("averageQuizScore", progress.getAverageQuizScore());
                studentProgress.put("lastActivityDate", progress.getLastActivityDate());
                
                // Progression par module
                List<FormationModuleProgress> moduleProgresses = moduleProgressRepository.findByFormationProgress(progress);
                List<Map<String, Object>> modulesData = new ArrayList<>();
                for (FormationModuleProgress mp : moduleProgresses) {
                    Map<String, Object> moduleData = new HashMap<>();
                    moduleData.put("moduleId", mp.getModule().getId());
                    moduleData.put("moduleTitle", mp.getModule().getTitle());
                    moduleData.put("progressPercentage", mp.getProgressPercentage());
                    moduleData.put("isCompleted", mp.isCompleted());
                    moduleData.put("isModuleValidated", mp.isModuleValidated());
                    modulesData.add(moduleData);
                }
                studentProgress.put("modules", modulesData);
                
                progressionData.add(studentProgress);
            }
            
            return ResponseEntity.ok(progressionData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching progression", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Crée une formation (Admin)
     * API: POST /api/admin/formations
     */
    @PostMapping
    public ResponseEntity<?> createFormation(
            @RequestBody Map<String, Object> formationData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (formationData == null || formationData.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Formation data is required"));
            }
            
            Formation formation = new Formation();
            
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
            if (formationData.containsKey("duration")) {
                Object durationObj = formationData.get("duration");
                if (durationObj instanceof Number) {
                    formation.setDuration(((Number) durationObj).doubleValue());
                }
            }
            if (formationData.containsKey("thumbnail")) {
                formation.setThumbnail((String) formationData.get("thumbnail"));
            }
            
            // Si un formateur est spécifié
            User assignedTrainer = null;
            if (formationData.containsKey("trainerId") || formationData.containsKey("createdBy")) {
                String trainerId = (String) formationData.getOrDefault("trainerId", formationData.get("createdBy"));
                if (trainerId != null && !trainerId.isEmpty()) {
                    User trainer = userRepository.findById(trainerId).orElse(null);
                    if (trainer != null && trainer.getRole() == User.UserRole.TRAINER) {
                        formation.setCreatedBy(trainer);
                        assignedTrainer = trainer;
                    }
                }
            }
            
            // Par défaut, l'admin crée en DRAFT
            formation.setStatus(ContentStatus.DRAFT);
            
            Formation saved = formationRepository.save(formation);
            
            // Envoyer une notification au formateur si assigné
            if (assignedTrainer != null) {
                createFormationAssignmentNotification(assignedTrainer, saved);
            }
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error creating formation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Modifie une formation (Admin)
     * API: PUT /api/admin/formations/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFormation(
            @PathVariable String id,
            @RequestBody Map<String, Object> updateData,
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
            if (updateData.containsKey("duration")) {
                Object durationObj = updateData.get("duration");
                if (durationObj instanceof Number) {
                    formation.setDuration(((Number) durationObj).doubleValue());
                }
            }
            if (updateData.containsKey("thumbnail")) {
                formation.setThumbnail((String) updateData.get("thumbnail"));
            }
            if (updateData.containsKey("status")) {
                try {
                    String statusStr = ((String) updateData.get("status")).toUpperCase();
                    ContentStatus newStatus = ContentStatus.valueOf(statusStr);
                    formation.setStatus(newStatus);
                } catch (Exception e) {
                    // Invalid status, skip
                }
            }
            
            Formation saved = formationRepository.save(formation);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error updating formation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Supprime une formation (Admin)
     * API: DELETE /api/admin/formations/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFormation(
            @PathVariable String id,
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
            
            // Vérifier s'il y a des inscriptions
            long enrollmentCount = enrollmentRepository.countByFormation(formation);
            if (enrollmentCount > 0) {
                // Désactiver au lieu de supprimer
                formation.setStatus(ContentStatus.ARCHIVED);
                formationRepository.save(formation);
                return ResponseEntity.ok(Map.of(
                    "message", "Formation désactivée (ne peut pas être supprimée car elle est suivie par des apprenants)",
                    "formation", formation
                ));
            }
            
            formationRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error deleting formation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Valide ou refuse une formation
     * API: PATCH /api/admin/formations/{id}/validation
     */
    @PatchMapping("/{id}/validation")
    public ResponseEntity<?> validateFormation(
            @PathVariable String id,
            @RequestBody Map<String, Object> validationData,
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
            
            String action = (String) validationData.get("action"); // "approve" ou "reject"
            String reason = (String) validationData.getOrDefault("reason", "");
            
            String email = authentication.getName();
            User admin = userRepository.findByEmail(email).orElse(null);
            
            if ("approve".equalsIgnoreCase(action)) {
                if (formation.getStatus() != ContentStatus.PENDING) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Seules les formations en attente peuvent être approuvées"));
                }
                formation.setStatus(ContentStatus.PUBLISHED);
                formation.setValidatedAt(java.time.LocalDateTime.now());
                if (admin != null) {
                    formation.setValidatedBy(admin);
                }
            } else if ("reject".equalsIgnoreCase(action)) {
                if (formation.getStatus() != ContentStatus.PENDING) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Seules les formations en attente peuvent être rejetées"));
                }
                formation.setStatus(ContentStatus.REJECTED);
                formation.setRejectionReason(reason);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Action invalide. Utilisez 'approve' ou 'reject'"));
            }
            
            Formation saved = formationRepository.save(formation);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error validating formation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Associe ou change le formateur d'une formation
     * API: PATCH /api/admin/formations/{id}/formateur
     */
    @PatchMapping("/{id}/formateur")
    public ResponseEntity<?> assignTrainer(
            @PathVariable String id,
            @RequestBody Map<String, Object> trainerData,
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
            
            String trainerId = (String) trainerData.get("trainerId");
            if (trainerId == null || trainerId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Trainer ID is required"));
            }
            
            User trainer = userRepository.findById(trainerId).orElse(null);
            if (trainer == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Trainer not found"));
            }
            
            if (trainer.getRole() != User.UserRole.TRAINER) {
                return ResponseEntity.badRequest().body(Map.of("error", "L'utilisateur spécifié n'est pas un formateur"));
            }
            
            User previousTrainer = formation.getCreatedBy();
            formation.setCreatedBy(trainer);
            Formation saved = formationRepository.save(formation);
            
            // Envoyer une notification au formateur
            createFormationAssignmentNotification(trainer, saved);
            
            // Si un formateur précédent existait et est différent, lui envoyer une notification de changement
            if (previousTrainer != null && !previousTrainer.getId().equals(trainer.getId())) {
                createFormationUnassignmentNotification(previousTrainer, saved);
            }
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error assigning trainer", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Crée une notification pour le formateur lorsqu'une formation lui est assignée
     */
    private void createFormationAssignmentNotification(User trainer, Formation formation) {
        try {
            if (trainer != null && formation != null) {
                UserNotification notification = new UserNotification();
                notification.setUser(trainer);
                notification.setType(UserNotification.NotificationType.SYSTEM);
                notification.setTitle("Nouvelle formation assignée !");
                notification.setMessage(String.format(
                    "Une nouvelle formation '%s' vous a été assignée. Vous pouvez maintenant commencer à y ajouter du contenu.",
                    formation.getTitle()
                ));
                notification.setActionUrl("/trainer/content/formations/" + formation.getId());
                notification.setPriority(UserNotification.NotificationPriority.HIGH);
                notification.setRead(false);
                
                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            e.printStackTrace();
            // Ne pas faire échouer la création de formation si la notification échoue
        }
    }
    
    /**
     * Crée une notification pour le formateur lorsqu'une formation lui est retirée
     */
    private void createFormationUnassignmentNotification(User trainer, Formation formation) {
        try {
            if (trainer != null && formation != null) {
                UserNotification notification = new UserNotification();
                notification.setUser(trainer);
                notification.setType(UserNotification.NotificationType.SYSTEM);
                notification.setTitle("Formation réassignée");
                notification.setMessage(String.format(
                    "La formation '%s' ne vous est plus assignée. Elle a été réassignée à un autre formateur.",
                    formation.getTitle()
                ));
                notification.setPriority(UserNotification.NotificationPriority.MEDIUM);
                notification.setRead(false);
                
                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            e.printStackTrace();
            // Ne pas faire échouer l'assignation si la notification échoue
        }
    }
}

