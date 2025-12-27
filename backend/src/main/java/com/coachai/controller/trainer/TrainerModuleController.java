package com.coachai.controller.trainer;

import com.coachai.model.Module;
import com.coachai.model.User;
import com.coachai.model.Formation;
import com.coachai.model.Quiz;
import com.coachai.model.Course;
import com.coachai.repository.ModuleRepository;
import com.coachai.repository.UserRepository;
import com.coachai.repository.FormationRepository;
import com.coachai.repository.QuizRepository;
import com.coachai.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainer/modules")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerModuleController {
    @Autowired
    private ModuleRepository moduleRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FormationRepository formationRepository;
    
    @Autowired
    private QuizRepository quizRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @GetMapping
    public ResponseEntity<List<Module>> getModules(
            @RequestParam(required = false) String formationId,
            Authentication authentication) {
        // Vérifier l'authentification
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(List.of());
        }
        
        List<Module> modules;
        if (formationId != null) {
            modules = moduleRepository.findByFormationId(formationId);
        } else {
            // Get modules for trainer's formations
            modules = moduleRepository.findAll();
        }
        
        return ResponseEntity.ok(modules);
    }
    
    @PostMapping
    public ResponseEntity<?> createModule(
            @RequestBody java.util.Map<String, Object> moduleData,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
            
            Module module = new Module();
            module.setCreatedBy(trainer);
            // Par défaut, les modules sont PUBLISHED pour être visibles par les apprenants
            module.setStatus(com.coachai.model.ContentStatus.PUBLISHED);
            
            if (moduleData.containsKey("title")) {
                module.setTitle((String) moduleData.get("title"));
            }
            if (moduleData.containsKey("description")) {
                module.setDescription((String) moduleData.get("description"));
            }
            if (moduleData.containsKey("order")) {
                module.setOrder(((Number) moduleData.get("order")).intValue());
            }
            if (moduleData.containsKey("duration")) {
                module.setDuration(((Number) moduleData.get("duration")).doubleValue());
            }
            if (moduleData.containsKey("formationId")) {
                String formationId = (String) moduleData.get("formationId");
                Formation formation = formationRepository.findById(formationId).orElse(null);
                if (formation == null) {
                    return ResponseEntity.badRequest().body(java.util.Map.of("error", "Formation not found"));
                }
                module.setFormation(formation);
                
                // Validation: Vérifier que la somme des heures des modules ne dépasse pas les heures de la formation
                List<Module> existingModules = moduleRepository.findByFormationId(formationId);
                double totalModulesDuration = existingModules.stream()
                    .mapToDouble(Module::getDuration)
                    .sum();
                double newTotalDuration = totalModulesDuration + module.getDuration();
                
                if (newTotalDuration > formation.getDuration()) {
                    return ResponseEntity.badRequest().body(java.util.Map.of(
                        "error", "La somme des heures des modules (" + newTotalDuration + "h) dépasse la durée de la formation (" + formation.getDuration() + "h)"
                    ));
                }
            } else {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "formationId is required"));
            }
            
            Module saved = moduleRepository.save(module);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error creating module", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateModule(
            @PathVariable String id,
            @RequestBody java.util.Map<String, Object> updateData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(java.util.Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Module ID is required"));
            }
            
            if (updateData == null || updateData.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Request body is required"));
            }
            
            Module module = moduleRepository.findById(id).orElse(null);
            if (module == null) {
                return ResponseEntity.status(404).body(java.util.Map.of("error", "Module not found"));
            }
            
            if (updateData.containsKey("title")) {
                module.setTitle((String) updateData.get("title"));
            }
            if (updateData.containsKey("description")) {
                module.setDescription((String) updateData.get("description"));
            }
            if (updateData.containsKey("order")) {
                module.setOrder(((Number) updateData.get("order")).intValue());
            }
            if (updateData.containsKey("duration")) {
                Object durationObj = updateData.get("duration");
                if (durationObj instanceof Number) {
                    module.setDuration(((Number) durationObj).doubleValue());
                } else if (durationObj instanceof String) {
                    try {
                        module.setDuration(Double.parseDouble((String) durationObj));
                    } catch (NumberFormatException e) {
                        // Invalid duration, skip
                    }
                }
            }
            if (updateData.containsKey("status")) {
                try {
                    String statusStr = ((String) updateData.get("status")).toUpperCase();
                    module.setStatus(com.coachai.model.ContentStatus.valueOf(statusStr));
                } catch (Exception e) {
                    // Invalid status, skip
                }
            }
            
            Module saved = moduleRepository.save(module);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error updating module", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteModule(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(java.util.Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Module ID is required"));
            }
            
            if (!moduleRepository.existsById(id)) {
                return ResponseEntity.status(404).body(java.util.Map.of("error", "Module not found"));
            }
            
            moduleRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error deleting module", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Module> getModuleById(@PathVariable String id, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        return moduleRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/quiz")
    public ResponseEntity<?> getModuleQuiz(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(java.util.Map.of("error", "Unauthorized"));
            }
            
            Module module = moduleRepository.findById(id).orElse(null);
            if (module == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Chercher un cours spécial "Quiz Final" pour ce module
            List<Course> courses = courseRepository.findByModule(module);
            Course quizCourse = courses.stream()
                .filter(c -> c.getTitle() != null && c.getTitle().contains("Quiz Final"))
                .findFirst()
                .orElse(null);
            
            if (quizCourse != null) {
                List<Quiz> quizzes = quizRepository.findByCourse(quizCourse);
                if (!quizzes.isEmpty()) {
                    return ResponseEntity.ok(quizzes.get(0));
                }
            }
            
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error fetching module quiz", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping("/{id}/quiz")
    public ResponseEntity<?> createModuleQuiz(
            @PathVariable String id,
            @RequestBody java.util.Map<String, Object> quizData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(java.util.Map.of("error", "Unauthorized"));
            }
            
            String email = authentication.getName();
            User trainer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
            
            Module module = moduleRepository.findById(id).orElse(null);
            if (module == null) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Module not found"));
            }
            
            // Créer ou trouver un cours spécial "Quiz Final" pour ce module
            List<Course> courses = courseRepository.findByModule(module);
            Course quizCourse = courses.stream()
                .filter(c -> c.getTitle() != null && c.getTitle().contains("Quiz Final"))
                .findFirst()
                .orElse(null);
            
            if (quizCourse == null) {
                quizCourse = new Course();
                quizCourse.setTitle("Quiz Final - " + module.getTitle());
                quizCourse.setDescription("Quiz d'évaluation finale du module");
                quizCourse.setModule(module);
                quizCourse.setCreatedBy(trainer);
                quizCourse.setStatus(com.coachai.model.ContentStatus.PUBLISHED);
                quizCourse.setOrder(9999); // Dernier ordre
                quizCourse = courseRepository.save(quizCourse);
            }
            
            // Créer le quiz
            Quiz quiz = new Quiz();
            quiz.setCourse(quizCourse);
            quiz.setCreatedBy(trainer);
            quiz.setStatus(com.coachai.model.ContentStatus.PUBLISHED);
            
            if (quizData.containsKey("title")) {
                quiz.setTitle((String) quizData.get("title"));
            }
            if (quizData.containsKey("description")) {
                quiz.setDescription((String) quizData.get("description"));
            }
            if (quizData.containsKey("duration")) {
                quiz.setDuration(((Number) quizData.get("duration")).intValue());
            }
            if (quizData.containsKey("passingScore")) {
                quiz.setPassingScore(((Number) quizData.get("passingScore")).intValue());
            }
            if (quizData.containsKey("maxAttempts")) {
                quiz.setMaxAttempts(((Number) quizData.get("maxAttempts")).intValue());
            }
            if (quizData.containsKey("difficulty")) {
                try {
                    quiz.setDifficulty(Quiz.DifficultyLevel.valueOf(((String) quizData.get("difficulty")).toUpperCase()));
                } catch (Exception e) {
                    // Invalid difficulty, skip
                }
            }
            
            Quiz saved = quizRepository.save(quiz);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error creating module quiz", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

