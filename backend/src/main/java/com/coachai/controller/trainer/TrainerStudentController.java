package com.coachai.controller.trainer;

import com.coachai.model.Enrollment;
import com.coachai.model.Formation;
import com.coachai.model.User;
import com.coachai.repository.EnrollmentRepository;
import com.coachai.repository.FormationRepository;
import com.coachai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trainer/students")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerStudentController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FormationRepository formationRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @GetMapping
    public ResponseEntity<List<User>> getStudents(
            @RequestParam(required = false) String formationId,
            Authentication authentication) {
        String email = authentication.getName();
        User trainer = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Trainer not found"));
        
        if (formationId != null) {
            Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation not found"));
            
            // Get all enrollments for courses in this formation
            List<Enrollment> enrollments = enrollmentRepository.findAll();
            List<String> studentIds = enrollments.stream()
                .map(e -> e.getUser().getId())
                .distinct()
                .collect(Collectors.toList());
            
            List<User> students = userRepository.findAllById(studentIds);
            return ResponseEntity.ok(students);
        } else {
            // Get all students enrolled in trainer's formations
            List<User> students = userRepository.findByRole(User.UserRole.USER);
            return ResponseEntity.ok(students);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getStudent(@PathVariable String id) {
        return userRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}

