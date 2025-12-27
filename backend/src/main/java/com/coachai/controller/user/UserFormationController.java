package com.coachai.controller.user;

import com.coachai.model.*;
import com.coachai.repository.*;
import com.coachai.service.ModuleProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Contrôleur pour la gestion des formations côté utilisateur
 */
@RestController
@RequestMapping("/api/user/formations")
@CrossOrigin(origins = "http://localhost:4200")
public class UserFormationController {

    @Autowired
    private FormationRepository formationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FormationEnrollmentRepository enrollmentRepository;

    @Autowired
    private ModuleProgressService moduleProgressService;

    @Autowired
    private UserNotificationRepository notificationRepository;

    /**
     * Recherche des formations par spécialité et niveau
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchFormations(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String search,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            List<Formation> formations = formationRepository.findAll().stream()
                .filter(f -> f.getStatus() == com.coachai.model.ContentStatus.PUBLISHED)
                .collect(Collectors.toList());

            // Filtrer par catégorie
            if (category != null && !category.trim().isEmpty()) {
                formations = formations.stream()
                    .filter(f -> f.getCategory() != null && 
                               f.getCategory().toLowerCase().contains(category.toLowerCase()))
                    .collect(Collectors.toList());
            }

            // Filtrer par niveau
            if (level != null && !level.trim().isEmpty()) {
                try {
                    Formation.Level levelEnum = Formation.Level.valueOf(level.toUpperCase());
                    formations = formations.stream()
                        .filter(f -> f.getLevel() == levelEnum)
                        .collect(Collectors.toList());
                } catch (IllegalArgumentException e) {
                    // Niveau invalide, ignorer
                }
            }

            // Filtrer par recherche textuelle
            if (search != null && !search.trim().isEmpty()) {
                String searchLower = search.toLowerCase();
                formations = formations.stream()
                    .filter(f -> (f.getTitle() != null && f.getTitle().toLowerCase().contains(searchLower)) ||
                               (f.getDescription() != null && f.getDescription().toLowerCase().contains(searchLower)) ||
                               (f.getCategory() != null && f.getCategory().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
            }

            return ResponseEntity.ok(formations);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error searching formations", 
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    /**
     * Récupère les détails d'une formation
     * NOTE: Cette méthode a été supprimée car elle entrait en conflit avec 
     * UserFormationEnrollmentController.getFormationById qui fait la même chose.
     * Utilisez GET /api/user/formations/{id} depuis UserFormationEnrollmentController.
     */

    /**
     * Inscription à une formation
     * NOTE: Cette méthode a été supprimée car elle entrait en conflit avec 
     * UserFormationEnrollmentController.enrollInFormation qui fait la même chose.
     * Utilisez POST /api/user/formations/{formationId}/enroll depuis UserFormationEnrollmentController.
     */
    
    /**
     * Récupère les formations auxquelles l'utilisateur est inscrit
     */
    @GetMapping("/my-formations")
    public ResponseEntity<?> getMyFormations(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            List<FormationEnrollment> enrollments = enrollmentRepository.findByUser(user);
            return ResponseEntity.ok(enrollments);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching formations", 
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    /**
     * Récupère la progression d'un module
     */
    @GetMapping("/enrollments/{enrollmentId}/modules/{moduleId}/progress")
    public ResponseEntity<?> getModuleProgress(
            @PathVariable String enrollmentId,
            @PathVariable String moduleId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            ModuleProgress progress = moduleProgressService.getModuleProgress(enrollmentId, moduleId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching progress", 
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    /**
     * Marque le texte d'un module comme complété
     */
    @PostMapping("/enrollments/{enrollmentId}/modules/{moduleId}/complete-text")
    public ResponseEntity<?> completeText(
            @PathVariable String enrollmentId,
            @PathVariable String moduleId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            ModuleProgress progress = moduleProgressService.markTextCompleted(enrollmentId, moduleId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error completing text", 
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    /**
     * Marque la vidéo d'un module comme complétée
     */
    @PostMapping("/enrollments/{enrollmentId}/modules/{moduleId}/complete-video")
    public ResponseEntity<?> completeVideo(
            @PathVariable String enrollmentId,
            @PathVariable String moduleId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            ModuleProgress progress = moduleProgressService.markVideoCompleted(enrollmentId, moduleId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error completing video", 
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    /**
     * Marque le lab d'un module comme complété
     */
    @PostMapping("/enrollments/{enrollmentId}/modules/{moduleId}/complete-lab")
    public ResponseEntity<?> completeLab(
            @PathVariable String enrollmentId,
            @PathVariable String moduleId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            ModuleProgress progress = moduleProgressService.markLabCompleted(enrollmentId, moduleId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error completing lab", 
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    /**
     * Soumet le quiz d'un module
     */
    @PostMapping("/enrollments/{enrollmentId}/modules/{moduleId}/submit-quiz")
    public ResponseEntity<?> submitQuiz(
            @PathVariable String enrollmentId,
            @PathVariable String moduleId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> answers = (Map<String, Object>) request.get("answers");
            if (answers == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Answers are required"));
            }

            ModuleProgress progress = moduleProgressService.submitModuleQuiz(enrollmentId, moduleId, answers);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error submitting quiz", 
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    /**
     * Notifie l'admin et le formateur lorsqu'un étudiant s'inscrit
     */
    private void notifyAdminAndTrainerOnEnrollment(FormationEnrollment enrollment) {
        Formation formation = enrollment.getFormation();
        User student = enrollment.getUser();

        // Notifier les admins
        List<User> admins = userRepository.findByRole(User.UserRole.ADMIN);
        for (User admin : admins) {
            UserNotification notification = new UserNotification();
            notification.setUser(admin);
            notification.setType(UserNotification.NotificationType.ENROLLMENT);
            notification.setTitle("Nouvelle inscription à une formation");
            notification.setMessage(String.format(
                "L'étudiant %s %s s'est inscrit à la formation '%s'.",
                student.getFirstName(), student.getLastName(), formation.getTitle()
            ));
            notification.setPriority(UserNotification.NotificationPriority.MEDIUM);
            notification.setActionUrl("/admin/formations/" + formation.getId());
            notification.setCreatedBy("system");
            notification.setRead(false);
            notificationRepository.save(notification);
        }

        // Notifier le formateur assigné
        if (formation.getAssignedTo() != null) {
            UserNotification notification = new UserNotification();
            notification.setUser(formation.getAssignedTo());
            notification.setType(UserNotification.NotificationType.ENROLLMENT);
            notification.setTitle("Nouvel étudiant inscrit");
            notification.setMessage(String.format(
                "L'étudiant %s %s s'est inscrit à votre formation '%s'.",
                student.getFirstName(), student.getLastName(), formation.getTitle()
            ));
            notification.setPriority(UserNotification.NotificationPriority.MEDIUM);
            notification.setActionUrl("/trainer/formations/" + formation.getId());
            notification.setCreatedBy("system");
            notification.setRead(false);
            notificationRepository.save(notification);
        }
    }

    @Autowired
    private ModuleProgressRepository moduleProgressRepository;

    @Autowired
    private ModuleRepository moduleRepository;
}

