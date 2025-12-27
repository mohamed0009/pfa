package com.coachai.controller.trainer;

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
 * Controller pour le formateur : voir les étudiants inscrits à ses formations
 */
@RestController
@RequestMapping("/api/trainer/formations/students")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerFormationStudentController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FormationRepository formationRepository;
    
    @Autowired
    private FormationEnrollmentRepository enrollmentRepository;
    
    @Autowired
    private FormationProgressRepository progressRepository;
    
    @Autowired
    private FormationModuleProgressRepository moduleProgressRepository;
    
    /**
     * Récupère tous les étudiants inscrits aux formations du formateur
     */
    @GetMapping
    public ResponseEntity<?> getFormationStudents(
            @RequestParam(required = false) String formationId,
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
            
            List<Formation> formations;
            if (formationId != null) {
                Formation formation = formationRepository.findById(formationId).orElse(null);
                if (formation == null || !formation.getCreatedBy().getId().equals(trainer.getId())) {
                    return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
                }
                formations = List.of(formation);
            } else {
                formations = formationRepository.findByCreatedBy(trainer);
            }
            
            List<Map<String, Object>> studentsData = new ArrayList<>();
            
            for (Formation formation : formations) {
                List<FormationEnrollment> enrollments = enrollmentRepository.findByFormation(formation);
                
                for (FormationEnrollment enrollment : enrollments) {
                    User student = enrollment.getUser();
                    FormationProgress progress = enrollment.getProgress();
                    
                    Map<String, Object> studentData = new HashMap<>();
                    studentData.put("studentId", student.getId());
                    studentData.put("studentName", (student.getFirstName() != null ? student.getFirstName() : "") + 
                        " " + (student.getLastName() != null ? student.getLastName() : ""));
                    studentData.put("studentEmail", student.getEmail());
                    studentData.put("studentAvatar", student.getAvatarUrl());
                    studentData.put("formationId", formation.getId());
                    studentData.put("formationTitle", formation.getTitle());
                    studentData.put("enrollmentId", enrollment.getId());
                    studentData.put("enrolledAt", enrollment.getEnrolledAt());
                    studentData.put("status", enrollment.getStatus().toString());
                    
                    // Progression
                    if (progress != null) {
                        studentData.put("overallProgress", progress.getOverallProgress());
                        studentData.put("completedModules", progress.getCompletedModules());
                        studentData.put("totalModules", progress.getTotalModules());
                        studentData.put("completedLessons", progress.getCompletedLessons());
                        studentData.put("totalLessons", progress.getTotalLessons());
                        studentData.put("completedQuizzes", progress.getCompletedQuizzes());
                        studentData.put("totalQuizzes", progress.getTotalQuizzes());
                        studentData.put("averageQuizScore", progress.getAverageQuizScore());
                    } else {
                        studentData.put("overallProgress", 0);
                        studentData.put("completedModules", 0);
                        studentData.put("totalModules", 0);
                    }
                    
                    studentsData.add(studentData);
                }
            }
            
            return ResponseEntity.ok(studentsData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching students", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    /**
     * Récupère la progression détaillée d'un étudiant pour une formation
     */
    @GetMapping("/{studentId}/progress")
    public ResponseEntity<?> getStudentProgress(
            @PathVariable String studentId,
            @RequestParam String formationId,
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
            if (formation == null || !formation.getCreatedBy().getId().equals(trainer.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
            
            User student = userRepository.findById(studentId).orElse(null);
            if (student == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Student not found"));
            }
            
            FormationEnrollment enrollment = enrollmentRepository.findByUserAndFormation(student, formation).orElse(null);
            if (enrollment == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Student not enrolled in this formation"));
            }
            
            FormationProgress progress = enrollment.getProgress();
            if (progress == null) {
                return ResponseEntity.ok(Map.of("error", "No progress data"));
            }
            
            // Récupérer la progression par module
            List<FormationModuleProgress> moduleProgresses = moduleProgressRepository.findByFormationProgress(progress);
            List<Map<String, Object>> modulesData = new ArrayList<>();
            
            for (FormationModuleProgress mp : moduleProgresses) {
                Map<String, Object> moduleData = new HashMap<>();
                moduleData.put("moduleId", mp.getModule().getId());
                moduleData.put("moduleTitle", mp.getModule().getTitle());
                moduleData.put("progressPercentage", mp.getProgressPercentage());
                moduleData.put("completedLessons", mp.getCompletedLessons());
                moduleData.put("totalLessons", mp.getTotalLessons());
                moduleData.put("completedQuizzes", mp.getCompletedQuizzes());
                moduleData.put("totalQuizzes", mp.getTotalQuizzes());
                moduleData.put("isCompleted", mp.isCompleted());
                moduleData.put("isValidated", mp.isModuleValidated());
                moduleData.put("completedAt", mp.getCompletedAt());
                modulesData.add(moduleData);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("enrollmentId", enrollment.getId());
            response.put("overallProgress", progress.getOverallProgress());
            response.put("completedModules", progress.getCompletedModules());
            response.put("totalModules", progress.getTotalModules());
            response.put("completedLessons", progress.getCompletedLessons());
            response.put("totalLessons", progress.getTotalLessons());
            response.put("completedQuizzes", progress.getCompletedQuizzes());
            response.put("totalQuizzes", progress.getTotalQuizzes());
            response.put("averageQuizScore", progress.getAverageQuizScore());
            response.put("modules", modulesData);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching student progress", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

