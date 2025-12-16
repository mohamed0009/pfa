package com.coachai.controller.trainer;

import com.coachai.model.Module;
import com.coachai.model.User;
import com.coachai.repository.ModuleRepository;
import com.coachai.repository.UserRepository;
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
    
    @GetMapping
    public ResponseEntity<List<Module>> getModules(
            @RequestParam(required = false) String formationId,
            Authentication authentication) {
        String email = authentication.getName();
        User trainer = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Trainer not found"));
        
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
    public ResponseEntity<Module> createModule(
            @RequestBody Module module,
            Authentication authentication) {
        String email = authentication.getName();
        User trainer = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Trainer not found"));
        
        Module saved = moduleRepository.save(module);
        return ResponseEntity.ok(saved);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Module> updateModule(
            @PathVariable String id,
            @RequestBody Module updatedModule) {
        return moduleRepository.findById(id)
            .map(module -> {
                module.setTitle(updatedModule.getTitle());
                module.setDescription(updatedModule.getDescription());
                module.setOrder(updatedModule.getOrder());
                Module saved = moduleRepository.save(module);
                return ResponseEntity.ok(saved);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteModule(@PathVariable String id) {
        moduleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

