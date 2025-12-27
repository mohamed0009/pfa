package com.coachai.controller.admin;

import com.coachai.model.User;
import com.coachai.model.Enrollment;
import com.coachai.repository.UserRepository;
import com.coachai.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminUserController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired(required = false)
    private PasswordEncoder passwordEncoder;
    
    @GetMapping
    public ResponseEntity<?> getAllUsers(
            @RequestParam(required = false) String role,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            List<User> users;
            if (role != null && !role.isEmpty()) {
                try {
                    User.UserRole roleEnum = User.UserRole.valueOf(role.toUpperCase());
                    users = userRepository.findByRole(roleEnum);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid role parameter"));
                }
            } else {
                users = userRepository.findAll();
            }
            
            if (users == null) {
                users = List.of();
            }
            
            // Remove passwords from response
            users.forEach(user -> user.setPassword(null));
            
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching users", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }
            
            User user = userRepository.findById(id).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            user.setPassword(null); // Remove password
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching user", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable String id,
            @RequestBody(required = false) String statusStr,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }
            
            if (statusStr == null || statusStr.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }
            
            User.UserStatus status;
            try {
                // Remove quotes if present
                statusStr = statusStr.replace("\"", "").trim();
                status = User.UserStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid status", "validStatuses", "ACTIVE, INACTIVE, PENDING, SUSPENDED"));
            }
            
            User user = userRepository.findById(id).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            user.setStatus(status);
            User saved = userRepository.save(user);
            saved.setPassword(null); // Remove password
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error updating user status", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }
            
            if (!userRepository.existsById(id)) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error deleting user", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createUser(
            @RequestBody Map<String, Object> userData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (userData == null || userData.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User data is required"));
            }
            
            // Check if email already exists
            String email = (String) userData.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            email = email.trim();
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
            }
            
            User user = new User();
            user.setEmail(email);
            
            // Set password (default password if not provided)
            String password = (String) userData.get("password");
            if (password == null || password.trim().isEmpty()) {
                password = "password123"; // Default password
            }
            if (passwordEncoder != null) {
                user.setPassword(passwordEncoder.encode(password));
            } else {
                user.setPassword(password); // Fallback if no encoder
            }
            
            // Set name (firstName and lastName are required)
            String fullName = (String) userData.get("fullName");
            String firstName = null;
            String lastName = null;
            
            if (fullName != null && !fullName.trim().isEmpty()) {
                String[] nameParts = fullName.trim().split(" ", 2);
                firstName = nameParts[0];
                lastName = nameParts.length > 1 ? nameParts[1] : "";
            } else {
                firstName = (String) userData.get("firstName");
                lastName = (String) userData.get("lastName");
            }
            
            // Ensure firstName and lastName are not null (required fields)
            if (firstName == null || firstName.trim().isEmpty()) {
                firstName = email.split("@")[0]; // Use email prefix as fallback
            }
            if (lastName == null || lastName.trim().isEmpty()) {
                lastName = ""; // Empty string is allowed
            }
            
            user.setFirstName(firstName.trim());
            user.setLastName(lastName.trim());
            
            // Set role
            String roleStr = (String) userData.get("role");
            if (roleStr != null) {
                if (roleStr.equals("Apprenant")) {
                    user.setRole(User.UserRole.USER);
                } else if (roleStr.equals("Formateur")) {
                    user.setRole(User.UserRole.TRAINER);
                } else if (roleStr.equals("Administrateur")) {
                    user.setRole(User.UserRole.ADMIN);
                } else {
                    try {
                        user.setRole(User.UserRole.valueOf(roleStr.toUpperCase()));
                    } catch (IllegalArgumentException e) {
                        user.setRole(User.UserRole.USER);
                    }
                }
            } else {
                user.setRole(User.UserRole.USER);
            }
            
            // Set status
            String statusStr = (String) userData.get("status");
            if (statusStr != null) {
                try {
                    user.setStatus(User.UserStatus.valueOf(statusStr.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    user.setStatus(User.UserStatus.ACTIVE);
                }
            } else {
                user.setStatus(User.UserStatus.ACTIVE);
            }
            
            // Set formation and level
            user.setFormation((String) userData.get("training"));
            
            String levelStr = (String) userData.get("level");
            if (levelStr != null) {
                if (levelStr.equals("Débutant")) {
                    user.setNiveau(User.Level.DEBUTANT);
                } else if (levelStr.equals("Intermédiaire")) {
                    user.setNiveau(User.Level.INTERMEDIAIRE);
                } else if (levelStr.equals("Avancé")) {
                    user.setNiveau(User.Level.AVANCE);
                } else {
                    try {
                        user.setNiveau(User.Level.valueOf(levelStr.toUpperCase()));
                    } catch (IllegalArgumentException e) {
                        user.setNiveau(User.Level.DEBUTANT);
                    }
                }
            } else {
                user.setNiveau(User.Level.DEBUTANT);
            }
            
            user.setAvatarUrl((String) userData.get("avatarUrl"));
            
            // Password is already set above (lines 177-186), no need to set it again
            
            User saved = userRepository.save(user);
            saved.setPassword(null); // Remove password from response
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error creating user: " + e.getMessage());
            if (e.getCause() != null) {
                System.err.println("Cause: " + e.getCause().getMessage());
            }
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error creating user", 
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error",
                "details", e.getClass().getSimpleName()
            ));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable String id,
            @RequestBody Map<String, Object> updateData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }
            
            User user = userRepository.findById(id).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            // Update fields
            if (updateData.containsKey("email")) {
                String email = (String) updateData.get("email");
                if (email != null && !email.equals(user.getEmail()) && userRepository.existsByEmail(email)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
                }
                user.setEmail(email);
            }
            
            if (updateData.containsKey("fullName")) {
                String fullName = (String) updateData.get("fullName");
                if (fullName != null && !fullName.isEmpty()) {
                    String[] nameParts = fullName.split(" ", 2);
                    user.setFirstName(nameParts[0]);
                    user.setLastName(nameParts.length > 1 ? nameParts[1] : "");
                }
            }
            
            if (updateData.containsKey("firstName")) {
                user.setFirstName((String) updateData.get("firstName"));
            }
            if (updateData.containsKey("lastName")) {
                user.setLastName((String) updateData.get("lastName"));
            }
            
            if (updateData.containsKey("role")) {
                String roleStr = (String) updateData.get("role");
                if (roleStr != null) {
                    if (roleStr.equals("Apprenant")) {
                        user.setRole(User.UserRole.USER);
                    } else if (roleStr.equals("Formateur")) {
                        user.setRole(User.UserRole.TRAINER);
                    } else if (roleStr.equals("Administrateur")) {
                        user.setRole(User.UserRole.ADMIN);
                    } else {
                        try {
                            user.setRole(User.UserRole.valueOf(roleStr.toUpperCase()));
                        } catch (IllegalArgumentException e) {
                            // Keep existing role
                        }
                    }
                }
            }
            
            if (updateData.containsKey("status")) {
                String statusStr = (String) updateData.get("status");
                if (statusStr != null) {
                    try {
                        user.setStatus(User.UserStatus.valueOf(statusStr.toUpperCase()));
                    } catch (IllegalArgumentException e) {
                        // Keep existing status
                    }
                }
            }
            
            if (updateData.containsKey("training")) {
                user.setFormation((String) updateData.get("training"));
            }
            
            if (updateData.containsKey("level")) {
                String levelStr = (String) updateData.get("level");
                if (levelStr != null) {
                    if (levelStr.equals("Débutant")) {
                        user.setNiveau(User.Level.DEBUTANT);
                    } else if (levelStr.equals("Intermédiaire")) {
                        user.setNiveau(User.Level.INTERMEDIAIRE);
                    } else if (levelStr.equals("Avancé")) {
                        user.setNiveau(User.Level.AVANCE);
                    } else {
                        try {
                            user.setNiveau(User.Level.valueOf(levelStr.toUpperCase()));
                        } catch (IllegalArgumentException e) {
                            // Keep existing level
                        }
                    }
                }
            }
            
            if (updateData.containsKey("avatarUrl")) {
                user.setAvatarUrl((String) updateData.get("avatarUrl"));
            }
            
            // Update password if provided
            if (updateData.containsKey("password")) {
                String password = (String) updateData.get("password");
                if (password != null && !password.trim().isEmpty()) {
                    if (passwordEncoder != null) {
                        user.setPassword(passwordEncoder.encode(password));
                    } else {
                        user.setPassword(password); // Fallback if no encoder
                    }
                }
            }
            
            User saved = userRepository.save(user);
            saved.setPassword(null); // Remove password
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error updating user", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            long totalUsers = userRepository.count();
            long activeUsers = userRepository.findAll().stream()
                .filter(u -> u.getStatus() == User.UserStatus.ACTIVE)
                .count();
            long apprenants = userRepository.countByRole(User.UserRole.USER);
            long formateurs = userRepository.countByRole(User.UserRole.TRAINER);
            long administrateurs = userRepository.countByRole(User.UserRole.ADMIN);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("total", totalUsers);
            stats.put("active", activeUsers);
            stats.put("apprenants", apprenants);
            stats.put("formateurs", formateurs);
            stats.put("administrateurs", administrateurs);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching stats", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}


