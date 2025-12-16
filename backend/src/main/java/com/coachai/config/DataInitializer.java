package com.coachai.config;

import com.coachai.model.User;
import com.coachai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Créer un utilisateur USER de test
        if (!userRepository.existsByEmail("user@test.com")) {
            User user = new User();
            user.setEmail("user@test.com");
            user.setPassword(passwordEncoder.encode("test123"));
            user.setFirstName("Test");
            user.setLastName("User");
            user.setRole(User.UserRole.USER);
            user.setStatus(User.UserStatus.ACTIVE);
            userRepository.save(user);
            System.out.println("✅ Utilisateur USER créé : user@test.com / test123");
        }
        
        // Créer un utilisateur TRAINER de test
        if (!userRepository.existsByEmail("trainer@test.com")) {
            User trainer = new User();
            trainer.setEmail("trainer@test.com");
            trainer.setPassword(passwordEncoder.encode("test123"));
            trainer.setFirstName("Test");
            trainer.setLastName("Trainer");
            trainer.setRole(User.UserRole.TRAINER);
            trainer.setStatus(User.UserStatus.ACTIVE);
            userRepository.save(trainer);
            System.out.println("✅ Utilisateur TRAINER créé : trainer@test.com / test123");
        }
        
        // Créer un utilisateur ADMIN de test
        if (!userRepository.existsByEmail("admin@test.com")) {
            User admin = new User();
            admin.setEmail("admin@test.com");
            admin.setPassword(passwordEncoder.encode("test123"));
            admin.setFirstName("Test");
            admin.setLastName("Admin");
            admin.setRole(User.UserRole.ADMIN);
            admin.setStatus(User.UserStatus.ACTIVE);
            userRepository.save(admin);
            System.out.println("✅ Utilisateur ADMIN créé : admin@test.com / test123");
        }
        
        System.out.println("\n📋 Utilisateurs de test disponibles :");
        System.out.println("   👤 USER    : user@test.com / test123");
        System.out.println("   👨‍🏫 TRAINER : trainer@test.com / test123");
        System.out.println("   👨‍💼 ADMIN   : admin@test.com / test123\n");
    }
}

