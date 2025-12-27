package com.coachai.controller.trainer;

import com.coachai.model.Formation;
import com.coachai.model.User;
import com.coachai.model.ContentStatus;
import com.coachai.model.FormationEnrollment;
import com.coachai.model.FormationProgress;
import com.coachai.model.FormationModuleProgress;
import com.coachai.repository.FormationRepository;
import com.coachai.repository.UserRepository;
import com.coachai.repository.FormationEnrollmentRepository;
import com.coachai.repository.FormationProgressRepository;
import com.coachai.repository.FormationModuleProgressRepository;
import com.coachai.service.FormationValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/trainer/formations")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerFormationController {
    @Autowired
    private FormationRepository formationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FormationValidationService validationService;
    
    @Autowired
    private FormationEnrollmentRepository enrollmentRepository;
    
    @Autowired
    private FormationProgressRepository progressRepository;
    
    @Autowired
    private FormationModuleProgressRepository moduleProgressRepository;
    
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
            
            // Récupérer les formations assignées à ce formateur OU créées par lui
            List<Formation> allFormations = formationRepository.findAll();
            List<Formation> trainerFormations = allFormations.stream()
                .filter(f -> (f.getAssignedTo() != null && f.getAssignedTo().getId().equals(trainer.getId())) ||
                           (f.getCreatedBy() != null && f.getCreatedBy().getId().equals(trainer.getId())))
                .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(trainerFormations);
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
            // Auto-assigner le formateur qui crée la formation
            formation.setAssignedTo(trainer);
            // Règle: Une formation est créée en brouillon par le formateur
            formation.setStatus(ContentStatus.DRAFT);
            
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
                } else if (durationObj instanceof String) {
                    try {
                        formation.setDuration(Double.parseDouble((String) durationObj));
                    } catch (NumberFormatException e) {
                        // Invalid duration, skip
                    }
                }
            }
            if (formationData.containsKey("thumbnail")) {
                formation.setThumbnail((String) formationData.get("thumbnail"));
            }
            // Le formateur ne peut pas définir le statut directement (sauf DRAFT)
            // Le statut ne peut être changé que via submitForValidation
            
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
            
            // Vérifier que le formateur est assigné ou créateur
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email).orElse(null);
            if (trainer == null) {
                return ResponseEntity.status(403).body(Map.of("error", "Trainer not found"));
            }
            boolean isAssigned = formation.getAssignedTo() != null && formation.getAssignedTo().getId().equals(trainer.getId());
            boolean isCreator = formation.getCreatedBy() != null && formation.getCreatedBy().getId().equals(trainer.getId());
            if (!isAssigned && !isCreator) {
                return ResponseEntity.status(403).body(Map.of("error", "Vous ne pouvez modifier que les formations qui vous sont assignées"));
            }
            
            // Règle: Une formation publiée ne peut pas être modifiée directement
            if (formation.getStatus() == ContentStatus.PUBLISHED) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Une formation publiée ne peut pas être modifiée directement",
                    "message", "Vous devez la repasser en brouillon ou la dupliquer"
                ));
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
                } else if (durationObj instanceof String) {
                    try {
                        formation.setDuration(Double.parseDouble((String) durationObj));
                    } catch (NumberFormatException e) {
                        // Invalid duration, skip
                    }
                }
            }
            if (updateData.containsKey("thumbnail")) {
                formation.setThumbnail((String) updateData.get("thumbnail"));
            }
            // Permettre de repasser en brouillon si nécessaire
            if (updateData.containsKey("status")) {
                try {
                    String statusStr = ((String) updateData.get("status")).toUpperCase();
                    ContentStatus newStatus = ContentStatus.valueOf(statusStr);
                    // Le formateur peut seulement repasser en DRAFT
                    if (newStatus == ContentStatus.DRAFT) {
                        formation.setStatus(ContentStatus.DRAFT);
                    }
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
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFormation(@PathVariable String id, Authentication authentication) {
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
            
            // Vérifier que le formateur est le propriétaire
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email).orElse(null);
            if (trainer == null || !formation.getCreatedBy().getId().equals(trainer.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Vous ne pouvez supprimer que vos propres formations"));
            }
            
            // Règle: Le formateur ne peut pas supprimer une formation déjà suivie par des apprenants
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
            
            // Vérifier que le formateur est le propriétaire
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email).orElse(null);
            if (trainer == null || !formation.getCreatedBy().getId().equals(trainer.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Vous ne pouvez soumettre que vos propres formations"));
            }
            
            // Règle: Le formateur ne peut pas valider ses formations
            // Il peut seulement les soumettre pour validation
            
            // Vérifier que la formation peut être soumise (doit être en DRAFT)
            if (formation.getStatus() != ContentStatus.DRAFT && formation.getStatus() != ContentStatus.REJECTED) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Seules les formations en brouillon ou rejetées peuvent être soumises"
                ));
            }
            
            // Valider la formation avant soumission
            FormationValidationService.ValidationResult validation = validationService.validateForPublication(id);
            if (!validation.isValid()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "La formation ne peut pas être soumise",
                    "errors", validation.getErrors(),
                    "warnings", validation.getWarnings()
                ));
            }
            
            formation.setStatus(ContentStatus.PENDING);
            formation.setSubmittedForValidationAt(java.time.LocalDateTime.now());
            Formation saved = formationRepository.save(formation);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error submitting formation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Récupère les étudiants inscrits à une formation spécifique avec leur progression
     * Endpoint: GET /api/trainer/formations/{formationId}/students
     */
    @GetMapping("/{formationId}/students")
    public ResponseEntity<?> getFormationStudents(
            @PathVariable String formationId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email).orElse(null);
            
            if (trainer == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Trainer not found"));
            }
            
            Formation formation = formationRepository.findById(formationId).orElse(null);
            if (formation == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Formation not found"));
            }
            
            // Vérifier que le formateur est le propriétaire de la formation
            if (!formation.getCreatedBy().getId().equals(trainer.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied - Cette formation ne vous appartient pas"));
            }
            
            // Récupérer tous les étudiants inscrits à cette formation
            List<FormationEnrollment> enrollments = enrollmentRepository.findByFormation(formation);
            List<Map<String, Object>> studentsData = new ArrayList<>();
            
            for (FormationEnrollment enrollment : enrollments) {
                User student = enrollment.getUser();
                Optional<FormationProgress> progressOptional = progressRepository.findByEnrollment(enrollment);
                
                Map<String, Object> studentData = new HashMap<>();
                studentData.put("id", student.getId());
                studentData.put("firstName", student.getFirstName());
                studentData.put("lastName", student.getLastName());
                studentData.put("email", student.getEmail());
                studentData.put("avatarUrl", student.getAvatarUrl());
                studentData.put("enrollmentId", enrollment.getId());
                studentData.put("enrolledAt", enrollment.getEnrolledAt());
                studentData.put("status", enrollment.getStatus().toString());
                
                if (progressOptional.isPresent()) {
                    FormationProgress progress = progressOptional.get();
                    studentData.put("overallProgress", progress.getOverallProgress());
                    studentData.put("completedModules", progress.getCompletedModules());
                    studentData.put("totalModules", progress.getTotalModules());
                    studentData.put("completedLessons", progress.getCompletedLessons());
                    studentData.put("totalLessons", progress.getTotalLessons());
                    studentData.put("averageQuizScore", progress.getAverageQuizScore());
                    studentData.put("lastActivityDate", progress.getLastActivityDate());
                    
                    // Récupérer la progression par module
                    List<FormationModuleProgress> moduleProgresses = moduleProgressRepository.findByFormationProgress(progress);
                    List<Map<String, Object>> modulesProgressList = new ArrayList<>();
                    for (FormationModuleProgress mp : moduleProgresses) {
                        Map<String, Object> moduleMap = new HashMap<>();
                        moduleMap.put("moduleId", mp.getModule().getId());
                        moduleMap.put("moduleTitle", mp.getModule().getTitle());
                        moduleMap.put("progressPercentage", mp.getProgressPercentage());
                        moduleMap.put("isCompleted", mp.isCompleted());
                        moduleMap.put("isQuizPassed", mp.isQuizPassed());
                        moduleMap.put("isModuleValidated", mp.isModuleValidated());
                        moduleMap.put("completedLessons", mp.getCompletedLessons());
                        moduleMap.put("totalLessons", mp.getTotalLessons());
                        moduleMap.put("completedQuizzes", mp.getCompletedQuizzes());
                        moduleMap.put("totalQuizzes", mp.getTotalQuizzes());
                        modulesProgressList.add(moduleMap);
                    }
                    studentData.put("modulesProgress", modulesProgressList);
                } else {
                    studentData.put("overallProgress", 0);
                    studentData.put("completedModules", 0);
                    studentData.put("totalModules", 0);
                    studentData.put("completedLessons", 0);
                    studentData.put("totalLessons", 0);
                    studentData.put("averageQuizScore", 0);
                    studentData.put("modulesProgress", new ArrayList<>());
                }
                
                studentsData.add(studentData);
            }
            
            return ResponseEntity.ok(studentsData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching students for formation", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}


