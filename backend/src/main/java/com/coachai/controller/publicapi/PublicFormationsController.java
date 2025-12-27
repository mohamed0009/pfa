package com.coachai.controller.publicapi;

import com.coachai.model.ContentStatus;
import com.coachai.model.Course;
import com.coachai.model.Formation;
import com.coachai.repository.CourseRepository;
import com.coachai.repository.FormationRepository;
import com.coachai.repository.ModuleRepository;
import com.coachai.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/formations")
@CrossOrigin(origins = "http://localhost:4200")
public class PublicFormationsController {
    @Autowired
    private FormationRepository formationRepository;
    
    @Autowired
    private ModuleRepository moduleRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private QuizRepository quizRepository;
    
    /**
     * Get all published formations for public display
     */
    @GetMapping
    public ResponseEntity<?> getAllFormations(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level) {
        try {
            List<Formation> formations;
            
            if (category != null && !category.isEmpty()) {
                // Filtrer par catégorie et status en Java si la méthode n'existe pas
                try {
                    formations = formationRepository.findByCategoryAndStatus(category, ContentStatus.PUBLISHED);
                } catch (Exception e) {
                    // Fallback: filtrer en Java
                    formations = formationRepository.findByCategory(category).stream()
                        .filter(f -> f.getStatus() == ContentStatus.PUBLISHED)
                        .collect(java.util.stream.Collectors.toList());
                }
            } else if (level != null && !level.isEmpty()) {
                try {
                    Formation.Level levelEnum = Formation.Level.valueOf(level.toUpperCase());
                    try {
                        formations = formationRepository.findByLevelAndStatus(levelEnum, ContentStatus.PUBLISHED);
                    } catch (Exception e) {
                        // Fallback: filtrer en Java
                        formations = formationRepository.findByLevel(levelEnum).stream()
                            .filter(f -> f.getStatus() == ContentStatus.PUBLISHED)
                            .collect(java.util.stream.Collectors.toList());
                    }
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid level parameter",
                        "validLevels", new String[]{"DEBUTANT", "INTERMEDIAIRE", "AVANCE"}
                    ));
                }
            } else {
                formations = formationRepository.findByStatus(ContentStatus.PUBLISHED);
            }
            
            if (formations == null) {
                formations = new ArrayList<>();
            }
            
            List<Map<String, Object>> formationsList = new ArrayList<>();
            for (Formation formation : formations) {
                Map<String, Object> formationMap = new HashMap<>();
                formationMap.put("id", formation.getId());
                formationMap.put("title", formation.getTitle());
                formationMap.put("description", formation.getDescription());
                formationMap.put("thumbnail", formation.getThumbnail());
                formationMap.put("category", formation.getCategory());
                formationMap.put("level", formation.getLevel() != null ? formation.getLevel().name() : "DEBUTANT");
                formationMap.put("duration", formation.getDuration());
                formationMap.put("enrolledCount", formation.getEnrolledCount());
                formationMap.put("completionRate", formation.getCompletionRate());
                
                // Informations formateur
                try {
                    if (formation.getCreatedBy() != null) {
                        Map<String, String> trainer = new HashMap<>();
                        trainer.put("id", formation.getCreatedBy().getId());
                        trainer.put("firstName", formation.getCreatedBy().getFirstName() != null ? formation.getCreatedBy().getFirstName() : "");
                        trainer.put("lastName", formation.getCreatedBy().getLastName() != null ? formation.getCreatedBy().getLastName() : "");
                        trainer.put("avatarUrl", formation.getCreatedBy().getAvatarUrl() != null ? formation.getCreatedBy().getAvatarUrl() : "");
                        formationMap.put("trainer", trainer);
                    }
                } catch (Exception e) {
                    // Ignore trainer info if there's an error loading it
                    System.err.println("Error loading trainer info: " + e.getMessage());
                }
                
                // Compter modules et cours
                try {
                    long modulesCount = moduleRepository.countByFormation(formation);
                    formationMap.put("modulesCount", modulesCount);
                    
                    // Compter les cours
                    List<com.coachai.model.Module> modules = moduleRepository.findByFormation(formation);
                    if (modules != null) {
                        long coursesCount = modules.stream()
                            .mapToLong(m -> courseRepository.countByModule(m))
                            .sum();
                        formationMap.put("coursesCount", coursesCount);
                        
                        // Compter les quiz
                        long quizzesCount = 0;
                        for (com.coachai.model.Module module : modules) {
                            List<Course> moduleCourses = courseRepository.findByModule(module);
                            if (moduleCourses != null) {
                                for (Course course : moduleCourses) {
                                    quizzesCount += quizRepository.countByCourse(course);
                                }
                            }
                        }
                        formationMap.put("quizzesCount", quizzesCount);
                    } else {
                        formationMap.put("coursesCount", 0);
                        formationMap.put("quizzesCount", 0);
                    }
                } catch (Exception e) {
                    System.err.println("Error counting modules/courses/quizzes: " + e.getMessage());
                    e.printStackTrace();
                    formationMap.put("modulesCount", 0);
                    formationMap.put("coursesCount", 0);
                    formationMap.put("quizzesCount", 0);
                }
                
                formationsList.add(formationMap);
            }
            
            return ResponseEntity.ok(formationsList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error fetching formations",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }
    
    /**
     * Get formation by ID with full details
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getFormationById(@PathVariable String id) {
        try {
            Formation formation = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation not found"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", formation.getId());
            response.put("title", formation.getTitle());
            response.put("description", formation.getDescription());
            response.put("thumbnail", formation.getThumbnail());
            response.put("category", formation.getCategory());
            response.put("level", formation.getLevel() != null ? formation.getLevel().name() : "DEBUTANT");
            response.put("duration", formation.getDuration());
            response.put("enrolledCount", formation.getEnrolledCount());
            response.put("completionRate", formation.getCompletionRate());
            
            // Formateur
            if (formation.getCreatedBy() != null) {
                Map<String, String> trainer = new HashMap<>();
                trainer.put("id", formation.getCreatedBy().getId());
                trainer.put("firstName", formation.getCreatedBy().getFirstName());
                trainer.put("lastName", formation.getCreatedBy().getLastName());
                trainer.put("bio", formation.getCreatedBy().getBio());
                trainer.put("avatarUrl", formation.getCreatedBy().getAvatarUrl());
                response.put("trainer", trainer);
            }
            
            // Modules avec leurs cours
            List<com.coachai.model.Module> modules = moduleRepository.findByFormationOrderByOrderAsc(formation);
            List<Map<String, Object>> modulesList = new ArrayList<>();
            
            for (com.coachai.model.Module module : modules) {
                Map<String, Object> moduleMap = new HashMap<>();
                moduleMap.put("id", module.getId());
                moduleMap.put("title", module.getTitle());
                moduleMap.put("description", module.getDescription());
                moduleMap.put("order", module.getOrder());
                moduleMap.put("duration", module.getDuration());
                
                // Cours du module
                List<Course> courses = courseRepository.findByModuleOrderByOrderAsc(module);
                List<Map<String, Object>> coursesList = new ArrayList<>();
                
                for (Course course : courses) {
                    Map<String, Object> courseMap = new HashMap<>();
                    courseMap.put("id", course.getId());
                    courseMap.put("title", course.getTitle());
                    courseMap.put("description", course.getDescription());
                    courseMap.put("estimatedHours", course.getEstimatedHours());
                    courseMap.put("order", course.getOrder());
                    
                    // Compter les leçons
                    long lessonsCount = courseRepository.countLessonsByCourse(course);
                    courseMap.put("lessonsCount", lessonsCount);
                    
                    coursesList.add(courseMap);
                }
                
                moduleMap.put("courses", coursesList);
                moduleMap.put("coursesCount", coursesList.size());
                modulesList.add(moduleMap);
            }
            
            response.put("modules", modulesList);
            response.put("modulesCount", modulesList.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error fetching formation details",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }
}
