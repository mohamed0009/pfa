package com.coachai.controller;

import com.coachai.dto.AuthResponse;
import com.coachai.dto.LoginRequest;
import com.coachai.dto.SignupRequest;
import com.coachai.model.User;
import com.coachai.repository.UserRepository;
import com.coachai.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            System.out.println("🔐 Tentative de connexion pour: " + loginRequest.getEmail());
            
            // Vérifier si l'utilisateur existe
            User existingUser = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);
            if (existingUser == null) {
                System.out.println("❌ Utilisateur non trouvé: " + loginRequest.getEmail());
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Authentication failed");
                errorResponse.put("message", "Email ou mot de passe incorrect");
                return ResponseEntity.status(401).body(errorResponse);
            }
            
            System.out.println("✅ Utilisateur trouvé: " + existingUser.getEmail() + " (Status: " + existingUser.getStatus() + ")");
            
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name());
            
            System.out.println("✅ Connexion réussie pour: " + user.getEmail());
            
            AuthResponse response = new AuthResponse(
                token,
                "Bearer",
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name()
            );
            
            return ResponseEntity.ok(response);
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            System.out.println("❌ BadCredentialsException: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Authentication failed");
            errorResponse.put("message", "Email ou mot de passe incorrect");
            return ResponseEntity.status(401).body(errorResponse);
        } catch (Exception e) {
            System.out.println("❌ Exception lors de la connexion: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Authentication failed");
            errorResponse.put("message", e.getMessage() != null ? e.getMessage() : "Erreur d'authentification");
            return ResponseEntity.status(401).body(errorResponse);
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok("{\"message\":\"Backend is running!\"}");
    }
    
    /**
     * Endpoint temporaire pour créer l'utilisateur idrissi@etud.com
     * À supprimer en production
     */
    @PostMapping("/create-test-user")
    public ResponseEntity<?> createTestUser() {
        try {
            String email = "idrissi@etud.com";
            String password = "test123";
            
            // Vérifier si l'utilisateur existe déjà
            if (userRepository.existsByEmail(email)) {
                User existingUser = userRepository.findByEmail(email).orElse(null);
                if (existingUser != null) {
                    // Réinitialiser le mot de passe
                    existingUser.setPassword(passwordEncoder.encode(password));
                    existingUser.setStatus(User.UserStatus.ACTIVE);
                    userRepository.save(existingUser);
                    System.out.println("✅ Mot de passe réinitialisé pour: " + email);
                    return ResponseEntity.ok(Map.of(
                        "message", "Utilisateur existant, mot de passe réinitialisé",
                        "email", email,
                        "password", password
                    ));
                }
            }
            
            // Créer l'utilisateur
            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setFirstName("Idrissi");
            user.setLastName("Idrissi");
            user.setRole(User.UserRole.USER);
            user.setStatus(User.UserStatus.ACTIVE);
            user.setNiveau(User.Level.DEBUTANT);
            
            User savedUser = userRepository.save(user);
            System.out.println("✅ Utilisateur créé: " + email + " / " + password);
            
            return ResponseEntity.ok(Map.of(
                "message", "Utilisateur créé avec succès",
                "email", email,
                "password", password
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Erreur lors de la création",
                "message", e.getMessage()
            ));
        }
    }
    
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        try {
            // Validate role
            if (signupRequest.getRole() == null || signupRequest.getRole().trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Role is required");
                errorResponse.put("message", "Le rôle est requis");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            User.UserRole role;
            try {
                role = User.UserRole.valueOf(signupRequest.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid role");
                errorResponse.put("message", "Rôle invalide. Les rôles valides sont: USER, TRAINER, ADMIN");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Validate email format based on role
            String email = signupRequest.getEmail().trim().toLowerCase();
            
            boolean emailValid = false;
            String expectedDomain = "";
            
            switch (role) {
                case USER:
                    expectedDomain = "@etud.com";
                    emailValid = email.endsWith("@etud.com");
                    break;
                case TRAINER:
                    expectedDomain = "@form.com";
                    emailValid = email.endsWith("@form.com");
                    break;
                case ADMIN:
                    expectedDomain = "@adm.com";
                    emailValid = email.endsWith("@adm.com");
                    break;
            }
            
            if (!emailValid) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid email format for role");
                errorResponse.put("message", String.format("L'email doit se terminer par %s pour le rôle %s", expectedDomain, role));
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Check if email already exists
            if (userRepository.existsByEmail(email)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Email already taken");
                errorResponse.put("message", "Cet email est déjà utilisé");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Create user
            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
            user.setFirstName(signupRequest.getFirstName());
            user.setLastName(signupRequest.getLastName());
            user.setRole(role);
            user.setStatus(User.UserStatus.ACTIVE);
            
            // Save user to database
            User savedUser = userRepository.save(user);
            System.out.println("✅ User created successfully in database:");
            System.out.println("   - ID: " + savedUser.getId());
            System.out.println("   - Email: " + savedUser.getEmail());
            System.out.println("   - Name: " + savedUser.getFirstName() + " " + savedUser.getLastName());
            System.out.println("   - Role: " + savedUser.getRole());
            System.out.println("   - Status: " + savedUser.getStatus());
            
            String token = tokenProvider.generateToken(savedUser.getEmail(), savedUser.getRole().name());
            
            AuthResponse response = new AuthResponse(
                token,
                "Bearer",
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Registration failed");
            errorResponse.put("message", e.getMessage() != null ? e.getMessage() : "Erreur lors de l'inscription");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}


