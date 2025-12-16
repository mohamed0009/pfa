package com.coachai.controller.trainer;

import com.coachai.model.ContentStatus;
import com.coachai.model.Course;
import com.coachai.model.Formation;
import com.coachai.model.Module;
import com.coachai.repository.CourseRepository;
import com.coachai.repository.FormationRepository;
import com.coachai.repository.ModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/trainer/validation")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerValidationController {
    @Autowired
    private FormationRepository formationRepository;
    
    @Autowired
    private ModuleRepository moduleRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @PostMapping("/submit")
    public ResponseEntity<?> submitForValidation(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        String id = request.get("id");
        String type = request.get("type");
        
        switch (type) {
            case "formation":
                return formationRepository.findById(id)
                    .map(formation -> {
                        formation.setStatus(ContentStatus.PENDING);
                        formation.setSubmittedForValidationAt(LocalDateTime.now());
                        Formation saved = formationRepository.save(formation);
                        return ResponseEntity.ok(saved);
                    })
                    .orElse(ResponseEntity.notFound().build());
            
            case "module":
                return moduleRepository.findById(id)
                    .map(module -> {
                        module.setStatus(ContentStatus.PENDING);
                        Module saved = moduleRepository.save(module);
                        return ResponseEntity.ok(saved);
                    })
                    .orElse(ResponseEntity.notFound().build());
            
            case "course":
                return courseRepository.findById(id)
                    .map(course -> {
                        course.setStatus(ContentStatus.PENDING);
                        Course saved = courseRepository.save(course);
                        return ResponseEntity.ok(saved);
                    })
                    .orElse(ResponseEntity.notFound().build());
            
            default:
                return ResponseEntity.badRequest().body("Invalid type");
        }
    }
}

