package com.coachai.controller.admin;

import com.coachai.model.ContentStatus;
import com.coachai.model.Formation;
import com.coachai.model.Course;
import com.coachai.model.User;
import com.coachai.model.UserNotification;
import com.coachai.model.AIRecommendation;
import com.coachai.repository.FormationRepository;
import com.coachai.repository.CourseRepository;
import com.coachai.repository.UserRepository;
import com.coachai.repository.AIRecommendationRepository;
import com.coachai.repository.UserNotificationRepository;
import com.coachai.service.FormationValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FormationValidationService validationService;
    
    @Autowired
    private UserNotificationRepository notificationRepository;
    
    @Autowired
    private AIRecommendationRepository aiRecommendationRepository;
    
    @GetMapping("/formations")
    public ResponseEntity<?> getAllFormations(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            List<Formation> formations = formationRepository.findAll();
            if (formations == null) {
                formations = List.of();
            }
            return ResponseEntity.ok(formations);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching formations", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
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
            
            // Vérifier que la formation est en attente de validation
            if (formation.getStatus() != ContentStatus.PENDING) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Seules les formations en attente peuvent être approuvées",
                    "currentStatus", formation.getStatus().toString()
                ));
            }
            
            // Valider la formation avant approbation
            FormationValidationService.ValidationResult validation = validationService.validateForPublication(id);
            if (!validation.isValid()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "La formation ne peut pas être approuvée",
                    "errors", validation.getErrors(),
                    "warnings", validation.getWarnings()
                ));
            }
            
            // Règle: Une formation ne peut être publiée qu'après validation par l'admin
            // et présence d'au moins 1 cours, chaque cours avec au moins 1 module,
            // chaque module avec au moins 1 leçon et 1 quiz
            
            String email = authentication.getName();
            User admin = userRepository.findByEmail(email).orElse(null);
            
            formation.setStatus(ContentStatus.PUBLISHED);
            formation.setValidatedAt(LocalDateTime.now());
            formation.setPublishedAt(LocalDateTime.now());
            if (admin != null) {
                formation.setValidatedBy(admin);
            }
            
            Formation saved = formationRepository.save(formation);
            
            // Notifier l'utilisateur et le formateur
            notifyUserAndTrainerOnApproval(saved, admin);
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error approving formation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Notifie l'utilisateur et le formateur lorsqu'une formation est approuvée
     */
    private void notifyUserAndTrainerOnApproval(Formation formation, User admin) {
        // Notifier le formateur
        if (formation.getCreatedBy() != null) {
            UserNotification trainerNotification = new UserNotification();
            trainerNotification.setUser(formation.getCreatedBy());
            trainerNotification.setType(UserNotification.NotificationType.SYSTEM);
            trainerNotification.setTitle("Formation approuvée");
            trainerNotification.setMessage(String.format(
                "Votre formation '%s' a été approuvée par l'administrateur %s %s et est maintenant disponible pour les étudiants.",
                formation.getTitle(),
                admin != null ? admin.getFirstName() : "Admin",
                admin != null ? admin.getLastName() : ""
            ));
            trainerNotification.setPriority(UserNotification.NotificationPriority.HIGH);
            trainerNotification.setActionUrl("/trainer/formations/" + formation.getId());
            trainerNotification.setCreatedBy("system");
            trainerNotification.setRead(false);
            notificationRepository.save(trainerNotification);
        }
        
        // Notifier les étudiants ciblés par la recommandation ML
        List<AIRecommendation> relatedRecommendations = aiRecommendationRepository.findAll().stream()
            .filter(rec -> rec.getSpecialty() != null && 
                         rec.getSpecialty().equals(formation.getCategory()) &&
                         rec.getStatus() == AIRecommendation.RecommendationStatus.APPROVED)
            .collect(java.util.stream.Collectors.toList());
        
        for (AIRecommendation rec : relatedRecommendations) {
            if (rec.getTargetStudents() != null) {
                for (String studentId : rec.getTargetStudents()) {
                    User student = userRepository.findById(studentId).orElse(null);
                    if (student != null) {
                        UserNotification studentNotification = new UserNotification();
                        studentNotification.setUser(student);
                        studentNotification.setType(UserNotification.NotificationType.NEW_CONTENT);
                        studentNotification.setTitle("Nouvelle formation disponible");
                        studentNotification.setMessage(String.format(
                            "Une nouvelle formation '%s' basée sur vos conversations avec l'IA est maintenant disponible. " +
                            "Cette formation a été recommandée selon votre niveau (%s) et vos intérêts.",
                            formation.getTitle(),
                            rec.getLevel() != null ? rec.getLevel() : "intermédiaire"
                        ));
                        studentNotification.setPriority(UserNotification.NotificationPriority.HIGH);
                        studentNotification.setActionUrl("/user/formations/" + formation.getId());
                        studentNotification.setCreatedBy("system");
                        studentNotification.setRead(false);
                        notificationRepository.save(studentNotification);
                    }
                }
            }
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
            
            // Vérifier que la formation est en attente de validation
            if (formation.getStatus() != ContentStatus.PENDING) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Seules les formations en attente peuvent être rejetées",
                    "currentStatus", formation.getStatus().toString()
                ));
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
    
    @PostMapping("/formations/{id}/request-correction")
    public ResponseEntity<?> requestCorrection(
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
                : "Corrections requested by admin";
            
            // Repasser en DRAFT pour corrections
            formation.setStatus(ContentStatus.DRAFT);
            formation.setRejectionReason(reason);
            Formation saved = formationRepository.save(formation);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error requesting correction", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Assigne un formateur à une formation
     */
    @PutMapping("/formations/{id}/assign")
    public ResponseEntity<?> assignFormationToTrainer(
            @PathVariable String id,
            @RequestBody Map<String, Object> assignData,
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

            if (assignData.containsKey("trainerId")) {
                String trainerId = (String) assignData.get("trainerId");
                User trainer = userRepository.findById(trainerId).orElse(null);
                if (trainer == null) {
                    return ResponseEntity.status(404).body(Map.of("error", "Trainer not found"));
                }
                if (trainer.getRole() != User.UserRole.TRAINER) {
                    return ResponseEntity.badRequest().body(Map.of("error", "User is not a trainer"));
                }
                formation.setAssignedTo(trainer);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "trainerId is required"));
            }

            Formation saved = formationRepository.save(formation);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error assigning formation", 
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    @PostMapping("/formations/{id}/disable")
    public ResponseEntity<?> disableFormation(@PathVariable String id, Authentication authentication) {
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
            
            // L'admin peut désactiver une formation publiée
            if (formation.getStatus() == ContentStatus.PUBLISHED) {
                formation.setStatus(ContentStatus.ARCHIVED);
                Formation saved = formationRepository.save(formation);
                return ResponseEntity.ok(saved);
            }
            
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Seules les formations publiées peuvent être désactivées",
                "currentStatus", formation.getStatus().toString()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error disabling formation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping("/courses/{id}/approve")
    public ResponseEntity<?> approveCourse(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course ID is required"));
            }
            
            Course course = courseRepository.findById(id).orElse(null);
            if (course == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Course not found"));
            }
            
            course.setStatus(ContentStatus.APPROVED);
            course.setValidatedAt(java.time.LocalDateTime.now());
            Course saved = courseRepository.save(course);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error approving course", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping("/courses/{id}/reject")
    public ResponseEntity<?> rejectCourse(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> reasonData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Course ID is required"));
            }
            
            Course course = courseRepository.findById(id).orElse(null);
            if (course == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Course not found"));
            }
            
            String reason = reasonData != null && reasonData.containsKey("reason") 
                ? (String) reasonData.get("reason") 
                : "Rejected by admin";
            
            course.setStatus(ContentStatus.REJECTED);
            course.setRejectionReason(reason);
            Course saved = courseRepository.save(course);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error rejecting course", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}


