package com.coachai.controller.user;

import com.coachai.model.*;
import com.coachai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Controller pour les inscriptions aux formations
 */
@RestController
@RequestMapping("/api/user/formations")
@CrossOrigin(origins = "http://localhost:4200")
public class UserFormationEnrollmentController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FormationRepository formationRepository;
    
    @Autowired
    private FormationEnrollmentRepository enrollmentRepository;
    
    @Autowired
    private FormationProgressRepository progressRepository;
    
    @Autowired
    private ModuleRepository moduleRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private LessonRepository lessonRepository;
    
    @Autowired
    private QuizRepository quizRepository;
    
    @Autowired
    private UserNotificationRepository notificationRepository;
    
    /**
     * Récupère toutes les formations disponibles (publiées)
     */
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableFormations(Authentication authentication) {
        try {
            List<Formation> formations = formationRepository.findByStatus(ContentStatus.PUBLISHED);
            if (formations == null) {
                formations = List.of();
            }
            return ResponseEntity.ok(formations);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching formations", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Récupère une formation par son ID (pour les étudiants)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getFormationById(
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
            
            // Vérifier que la formation est publiée (accessible aux étudiants)
            if (formation.getStatus() != ContentStatus.PUBLISHED) {
                return ResponseEntity.status(403).body(Map.of(
                    "error", "Cette formation n'est pas disponible",
                    "status", formation.getStatus().toString()
                ));
            }
            
            // Forcer le chargement des modules (nouvelle architecture: modules contiennent directement le contenu)
            if (formation.getModules() != null) {
                formation.getModules().forEach(module -> {
                    // Initialiser le module pour éviter les erreurs de lazy loading
                    module.getId();
                    // Charger le quiz si présent
                    if (module.getQuiz() != null) {
                        module.getQuiz().getId();
                    }
                });
            }
            
            return ResponseEntity.ok(formation);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching formation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Récupère les formations auxquelles l'utilisateur est inscrit
     */
    @GetMapping("/enrolled")
    public ResponseEntity<?> getEnrolledFormations(Authentication authentication) {
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
            if (enrollments == null) {
                enrollments = List.of();
            }
            
            // S'assurer que les formations sont chargées (EAGER fetch)
            enrollments.forEach(enrollment -> {
                if (enrollment.getFormation() != null) {
                    // Forcer le chargement du formateur
                    enrollment.getFormation().getCreatedBy();
                }
            });
            
            return ResponseEntity.ok(enrollments);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching enrolled formations", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Inscription à une formation
     */
    @PostMapping("/{formationId}/enroll")
    public ResponseEntity<?> enrollInFormation(
            @PathVariable String formationId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (formationId == null || formationId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Formation ID is required"));
            }
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            Formation formation = formationRepository.findById(formationId).orElse(null);
            if (formation == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Formation not found"));
            }
            
            // Vérifier que la formation est publiée
            if (formation.getStatus() != ContentStatus.PUBLISHED) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Cette formation n'est pas disponible",
                    "status", formation.getStatus().toString()
                ));
            }
            
            // Vérifier que la formation a du contenu (modules avec cours contenant des leçons)
            List<com.coachai.model.Module> modules = moduleRepository.findByFormationOrderByOrderAsc(formation);
            if (modules == null || modules.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Cette formation n'a pas encore de modules disponibles. Veuillez réessayer plus tard."
                ));
            }
            
            // Vérifier qu'au moins un module a du contenu (nouvelle architecture)
            // Les modules contiennent directement: textContent, videoUrl, labContent, quiz
            boolean hasContent = false;
            for (com.coachai.model.Module module : modules) {
                // Vérifier si le module a du contenu (texte, vidéo, lab ou quiz)
                if ((module.getTextContent() != null && !module.getTextContent().trim().isEmpty()) ||
                    (module.getVideoUrl() != null && !module.getVideoUrl().trim().isEmpty()) ||
                    (module.getLabContent() != null && !module.getLabContent().trim().isEmpty()) ||
                    (module.getQuiz() != null)) {
                    hasContent = true;
                    break;
                }
            }
            
            if (!hasContent) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Cette formation n'a pas encore de contenu disponible (texte, vidéos, labs, quiz). Veuillez réessayer plus tard."
                ));
            }
            
            // Vérifier si déjà inscrit - retourner l'enrollment existant au lieu d'une erreur
            FormationEnrollment existingEnrollment = enrollmentRepository.findByUserAndFormation(user, formation).orElse(null);
            if (existingEnrollment != null) {
                // Retourner l'enrollment existant pour permettre l'accès
                return ResponseEntity.ok(existingEnrollment);
            }
            
            // Créer l'inscription
            // Une formation inscrite passe automatiquement à l'état "EN_COURS"
            FormationEnrollment enrollment = new FormationEnrollment();
            enrollment.setUser(user);
            enrollment.setFormation(formation);
            enrollment.setStatus(FormationEnrollment.EnrollmentStatus.EN_COURS);
            enrollment.setEnrolledAt(LocalDateTime.now());
            enrollment.setStartedAt(LocalDateTime.now());
            
            // Créer la progression
            FormationProgress progress = new FormationProgress();
            progress.setEnrollment(enrollment);
            
            // Calculer les totaux (nouvelle architecture: modules contiennent directement le contenu)
            progress.setTotalModules(modules.size());
            
            // Dans la nouvelle architecture, les modules n'ont plus de cours
            // On compte les quiz directement depuis les modules
            int totalQuizzes = 0;
            for (com.coachai.model.Module module : modules) {
                if (module.getQuiz() != null) {
                    totalQuizzes++;
                }
            }
            
            // Pour compatibilité avec l'ancien système, on met 0 pour courses et lessons
            progress.setTotalCourses(0);
            progress.setTotalLessons(0);
            progress.setTotalQuizzes(totalQuizzes);
            
            enrollment.setProgress(progress);
            
            FormationEnrollment saved = enrollmentRepository.save(enrollment);
            progressRepository.save(progress);
            
            // Mettre à jour le compteur d'inscriptions
            formation.setEnrolledCount(formation.getEnrolledCount() + 1);
            formationRepository.save(formation);
            
            // Créer une notification pour le formateur
            createEnrollmentNotification(formation.getCreatedBy(), user, formation);
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error enrolling in formation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Crée une notification pour le formateur lorsqu'un étudiant s'inscrit à sa formation
     */
    private void createEnrollmentNotification(User trainer, User student, Formation formation) {
        try {
            if (trainer != null) {
                // Vérifier si le formateur a activé les notifications
                // Pour l'instant, on crée toujours la notification
                UserNotification notification = new UserNotification();
                notification.setUser(trainer);
                notification.setType(UserNotification.NotificationType.ENROLLMENT);
                notification.setTitle("Nouvelle inscription à votre formation !");
                notification.setMessage(String.format("%s %s s'est inscrit(e) à votre formation '%s'.",
                        student.getFirstName() != null ? student.getFirstName() : "Un étudiant",
                        student.getLastName() != null ? student.getLastName() : "",
                        formation.getTitle()));
                notification.setActionUrl("/trainer/content/formations/" + formation.getId() + "/students");
                notification.setPriority(UserNotification.NotificationPriority.MEDIUM);
                notification.setRead(false);
                
                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            // Ne pas faire échouer l'inscription si la notification échoue
            e.printStackTrace();
        }
    }
}
