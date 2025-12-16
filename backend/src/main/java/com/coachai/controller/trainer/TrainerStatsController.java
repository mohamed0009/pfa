package com.coachai.controller.trainer;

import com.coachai.model.Formation;
import com.coachai.model.User;
import com.coachai.repository.FormationRepository;
import com.coachai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trainer/stats")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerStatsController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FormationRepository formationRepository;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getStats(Authentication authentication) {
        String email = authentication.getName();
        User trainer = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Trainer not found"));
        
        List<Formation> formations = formationRepository.findByCreatedBy(trainer);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("trainerId", trainer.getId());
        stats.put("totalFormations", formations.size());
        stats.put("totalStudents", 0); // Calculate from enrollments
        stats.put("activeStudents", 0);
        stats.put("averageProgress", 0.0);
        stats.put("contentPendingValidation", 0);
        stats.put("contentApproved", 0);
        
        return ResponseEntity.ok(stats);
    }
}

