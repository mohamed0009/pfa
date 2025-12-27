package com.coachai.config;

import com.coachai.model.*;
import com.coachai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private FormationRepository formationRepository;
    
    @Autowired
    private ModuleRepository moduleRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private LessonRepository lessonRepository;
    
    @Autowired
    private QuizRepository quizRepository;
    
    @Autowired
    private QuizQuestionRepository quizQuestionRepository;
    
    @Autowired
    private QuizOptionRepository quizOptionRepository;
    
    @Autowired
    private ExerciseRepository exerciseRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private ConversationRepository conversationRepository;
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Override
    public void run(String... args) throws Exception {
        // Fix NULL values in chat_messages.read column
        fixChatMessagesReadColumn();
        // Créer un utilisateur USER de test (avec email @etud.com)
        User testUser = null;
        String userEmail = "user@etud.com";
        if (!userRepository.existsByEmail(userEmail)) {
            // Vérifier si l'ancien email existe et le mettre à jour
            User oldUser = userRepository.findByEmail("user@test.com").orElse(userRepository.findByEmail("user@etud").orElse(null));
            if (oldUser != null) {
                oldUser.setEmail(userEmail);
                oldUser.setPassword(passwordEncoder.encode("test123"));
                oldUser.setStatus(User.UserStatus.ACTIVE);
                testUser = userRepository.save(oldUser);
                System.out.println("✅ Email de l'utilisateur USER mis à jour : " + userEmail + " / test123");
            } else {
                testUser = new User();
                testUser.setEmail(userEmail);
                testUser.setPassword(passwordEncoder.encode("test123"));
                testUser.setFirstName("Test");
                testUser.setLastName("User");
                testUser.setRole(User.UserRole.USER);
                testUser.setStatus(User.UserStatus.ACTIVE);
                testUser = userRepository.save(testUser);
                System.out.println("✅ Utilisateur USER créé : " + userEmail + " / test123");
            }
        } else {
            testUser = userRepository.findByEmail(userEmail).orElse(null);
            // Réinitialiser le mot de passe pour s'assurer qu'il est correctement encodé
            if (testUser != null) {
                testUser.setPassword(passwordEncoder.encode("test123"));
                testUser.setStatus(User.UserStatus.ACTIVE);
                testUser = userRepository.save(testUser);
                System.out.println("✅ Mot de passe de l'utilisateur USER réinitialisé : " + userEmail + " / test123");
            }
        }
        
        // Créer un utilisateur TRAINER de test (avec email @form.com)
        User testTrainer = null;
        String trainerEmail = "trainer@form.com";
        if (!userRepository.existsByEmail(trainerEmail)) {
            // Vérifier si l'ancien email existe et le mettre à jour
            User oldTrainer = userRepository.findByEmail("trainer@test.com").orElse(userRepository.findByEmail("trainer@form").orElse(null));
            if (oldTrainer != null) {
                oldTrainer.setEmail(trainerEmail);
                oldTrainer.setPassword(passwordEncoder.encode("test123"));
                oldTrainer.setStatus(User.UserStatus.ACTIVE);
                testTrainer = userRepository.save(oldTrainer);
                System.out.println("✅ Email de l'utilisateur TRAINER mis à jour : " + trainerEmail + " / test123");
            } else {
                testTrainer = new User();
                testTrainer.setEmail(trainerEmail);
                testTrainer.setPassword(passwordEncoder.encode("test123"));
                testTrainer.setFirstName("Test");
                testTrainer.setLastName("Trainer");
                testTrainer.setRole(User.UserRole.TRAINER);
                testTrainer.setStatus(User.UserStatus.ACTIVE);
                testTrainer = userRepository.save(testTrainer);
                System.out.println("✅ Utilisateur TRAINER créé : " + trainerEmail + " / test123");
            }
        } else {
            testTrainer = userRepository.findByEmail(trainerEmail).orElse(null);
            // Réinitialiser le mot de passe pour s'assurer qu'il est correctement encodé
            if (testTrainer != null) {
                testTrainer.setPassword(passwordEncoder.encode("test123"));
                testTrainer.setStatus(User.UserStatus.ACTIVE);
                testTrainer = userRepository.save(testTrainer);
                System.out.println("✅ Mot de passe de l'utilisateur TRAINER réinitialisé : " + trainerEmail + " / test123");
            }
        }
        
        // Créer un utilisateur ADMIN de test (avec email @adm.com)
        User admin = null;
        String adminEmail = "admin@adm.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            // Vérifier si l'ancien email existe et le mettre à jour
            User oldAdmin = userRepository.findByEmail("admin@test.com").orElse(userRepository.findByEmail("admin@adm").orElse(null));
            if (oldAdmin != null) {
                oldAdmin.setEmail(adminEmail);
                oldAdmin.setPassword(passwordEncoder.encode("test123"));
                oldAdmin.setStatus(User.UserStatus.ACTIVE);
                admin = userRepository.save(oldAdmin);
                System.out.println("✅ Email de l'utilisateur ADMIN mis à jour : " + adminEmail + " / test123");
            } else {
                admin = new User();
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("test123"));
                admin.setFirstName("Test");
                admin.setLastName("Admin");
                admin.setRole(User.UserRole.ADMIN);
                admin.setStatus(User.UserStatus.ACTIVE);
                admin = userRepository.save(admin);
                System.out.println("✅ Utilisateur ADMIN créé : " + adminEmail + " / test123");
            }
        } else {
            admin = userRepository.findByEmail(adminEmail).orElse(null);
            // Réinitialiser le mot de passe pour s'assurer qu'il est correctement encodé
            if (admin != null) {
                admin.setPassword(passwordEncoder.encode("test123"));
                admin.setStatus(User.UserStatus.ACTIVE);
                admin = userRepository.save(admin);
                System.out.println("✅ Mot de passe de l'utilisateur ADMIN réinitialisé : " + adminEmail + " / test123");
            }
        }
        
        // Créer des utilisateurs supplémentaires
        createAdditionalUsers();
        
        // Créer des formations, modules et cours de test si le formateur existe
        if (testTrainer != null) {
            createTestContent(testTrainer, testUser);
        }
        
        System.out.println("\n📋 Utilisateurs de test disponibles :");
        System.out.println("   👤 USER    : user@etud.com / test123");
        System.out.println("   👤 USER    : idrissi@etud.com / test123");
        System.out.println("   👤 USER    : zaineb@etud.com / test123");
        System.out.println("   👨‍🏫 TRAINER : trainer@form.com / test123");
        System.out.println("   👨‍💼 ADMIN   : admin@adm.com / test123\n");
    }
    
    private void createAdditionalUsers() {
        // Créer Zaineb BAANNI et Idrissi (Thomas Dubois est déjà créé dans seed_complete_formations.sql)
        String[] userEmails = {
            "zaineb@etud.com",
            "idrissi@etud.com"
        };
        
        String[] firstNames = {"Zaineb", "Idrissi"};
        String[] lastNames = {"BAANNI", "Idrissi"};
        
        for (int i = 0; i < userEmails.length; i++) {
            String email = userEmails[i];
            // Vérifier si l'ancien email existe et le mettre à jour
            User oldUser = null;
            if (email.equals("zaineb@etud.com")) {
                oldUser = userRepository.findByEmail("zaineb@test.com").orElse(userRepository.findByEmail("zaineb@etud").orElse(null));
            } else if (email.equals("idrissi@etud.com")) {
                oldUser = userRepository.findByEmail("idrissi@test.com").orElse(null);
            }
            
            if (oldUser != null) {
                oldUser.setEmail(email);
                oldUser.setPassword(passwordEncoder.encode("test123"));
                oldUser.setStatus(User.UserStatus.ACTIVE);
                userRepository.save(oldUser);
                System.out.println("✅ Email de l'utilisateur mis à jour : " + email + " / test123");
            } else if (!userRepository.existsByEmail(email)) {
                User user = new User();
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode("test123"));
                user.setFirstName(firstNames[i]);
                user.setLastName(lastNames[i]);
                user.setRole(User.UserRole.USER);
                user.setStatus(User.UserStatus.ACTIVE);
                user.setNiveau(User.Level.DEBUTANT);
                userRepository.save(user);
                System.out.println("✅ Utilisateur créé : " + email + " / test123");
            } else {
                // L'utilisateur existe déjà, réinitialiser le mot de passe
                User existingUser = userRepository.findByEmail(email).orElse(null);
                if (existingUser != null) {
                    existingUser.setPassword(passwordEncoder.encode("test123"));
                    existingUser.setStatus(User.UserStatus.ACTIVE);
                    userRepository.save(existingUser);
                    System.out.println("✅ Mot de passe de l'utilisateur réinitialisé : " + email + " / test123");
                }
            }
        }
    }
    
    private void createTestContent(User trainer, User testUser) {
        try {
            // Vérifier si des cours existent déjà avec du contenu
            long courseCount = courseRepository.count();
            long lessonCount = lessonRepository.count();
            
            // Si des cours existent mais n'ont pas de leçons, on les complète
            if (courseCount > 0 && lessonCount == 0) {
                System.out.println("ℹ️  Des cours existent mais n'ont pas de contenu. Complétion en cours...");
                completeExistingFormations(trainer);
                return;
            }
            
            // Si des cours avec contenu existent déjà, on ne recrée rien
            if (courseCount > 0 && lessonCount > 0) {
                System.out.println("ℹ️  Des cours avec contenu existent déjà dans la base de données. Skipping test data creation.");
                // Mais on vérifie quand même s'il y a des formations sans contenu
                completeExistingFormations(trainer);
                return;
            }
            
            System.out.println("\n📚 Création de contenu de test...");
            
            // 1. Créer une formation
            Formation formation = new Formation();
            formation.setTitle("Formation Complète en Développement Web");
            formation.setDescription("Une formation complète pour apprendre le développement web moderne avec HTML, CSS, JavaScript, React et Node.js.");
            formation.setCategory("Développement");
            formation.setLevel(Formation.Level.INTERMEDIAIRE);
            formation.setDuration(120.0); // 120 heures
            formation.setStatus(ContentStatus.PUBLISHED);
            formation.setCreatedBy(trainer);
            formation = formationRepository.save(formation);
            System.out.println("✅ Formation créée : " + formation.getTitle());
            
            // 2. Créer un module dans la formation
            com.coachai.model.Module module = new com.coachai.model.Module();
            module.setTitle("Module 1 : Bases du Web");
            module.setDescription("Introduction aux technologies web fondamentales");
            module.setFormation(formation);
            module.setOrder(1);
            module.setDuration(20.0); // 20 heures
            module.setStatus(ContentStatus.PUBLISHED);
            module = moduleRepository.save(module);
            System.out.println("✅ Module créé : " + module.getTitle());
            
            // 3. Créer des cours PUBLISHED (visibles pour les utilisateurs)
            Course course1 = new Course();
            course1.setTitle("Introduction à HTML et CSS");
            course1.setSubtitle("Apprenez les bases du développement web");
            course1.setDescription("Un cours complet pour débuter avec HTML et CSS. Vous apprendrez à créer des pages web modernes et responsives.");
            course1.setLongDescription("Ce cours vous permettra de maîtriser les fondamentaux du développement web. Vous découvrirez comment structurer une page HTML, styliser avec CSS, et créer des designs responsives.");
            course1.setCategory("Développement");
            course1.setLevel(Course.Level.DEBUTANT);
            course1.setInstructorName(trainer.getFirstName() + " " + trainer.getLastName());
            course1.setInstructorTitle("Formateur en Développement Web");
            course1.setThumbnailUrl("https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800");
            course1.setModule(module);
            course1.setStatus(ContentStatus.PUBLISHED);
            course1.setCreatedBy(trainer);
            course1.setDuration("10 heures");
            course1.setEstimatedHours(10);
            course1.setEnrolledCount(0);
            course1.setOrder(1); // Ajouter l'ordre
            course1 = courseRepository.save(course1);
            System.out.println("✅ Cours créé : " + course1.getTitle());
            
            // Ajouter du contenu complet au cours 1
            addCompleteContentToCourse(course1, trainer);
            
            Course course2 = new Course();
            course2.setTitle("JavaScript Moderne pour Débutants");
            course2.setSubtitle("Maîtrisez JavaScript de zéro à héros");
            course2.setDescription("Apprenez JavaScript de manière progressive avec des exemples pratiques et des projets réels.");
            course2.setLongDescription("Ce cours vous enseignera JavaScript depuis les bases jusqu'aux concepts avancés. Vous travaillerez sur des projets concrets et apprendrez les meilleures pratiques.");
            course2.setCategory("Développement");
            course2.setLevel(Course.Level.DEBUTANT);
            course2.setInstructorName(trainer.getFirstName() + " " + trainer.getLastName());
            course2.setInstructorTitle("Formateur en Développement Web");
            course2.setThumbnailUrl("https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800");
            course2.setModule(module);
            course2.setStatus(ContentStatus.PUBLISHED);
            course2.setCreatedBy(trainer);
            course2.setDuration("15 heures");
            course2.setEstimatedHours(15);
            course2.setEnrolledCount(0);
            course2.setOrder(2); // Ajouter l'ordre
            course2 = courseRepository.save(course2);
            System.out.println("✅ Cours créé : " + course2.getTitle());
            
            // Ajouter du contenu complet au cours 2
            addCompleteContentToCourse(course2, trainer);
            
            // 4. Créer un cours standalone (sans module) - aussi visible
            Course standaloneCourse = new Course();
            standaloneCourse.setTitle("React : Développement Frontend Moderne");
            standaloneCourse.setSubtitle("Créez des applications React professionnelles");
            standaloneCourse.setDescription("Apprenez React, la bibliothèque JavaScript la plus populaire pour créer des interfaces utilisateur modernes.");
            standaloneCourse.setLongDescription("Ce cours vous guidera à travers React, depuis les concepts de base jusqu'aux techniques avancées. Vous créerez des applications complètes et apprendrez à gérer l'état, les hooks, et le routage.");
            standaloneCourse.setCategory("Développement");
            standaloneCourse.setLevel(Course.Level.INTERMEDIAIRE);
            standaloneCourse.setInstructorName(trainer.getFirstName() + " " + trainer.getLastName());
            standaloneCourse.setInstructorTitle("Formateur en Développement Web");
            standaloneCourse.setThumbnailUrl("https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800");
            standaloneCourse.setStatus(ContentStatus.PUBLISHED);
            standaloneCourse.setCreatedBy(trainer);
            standaloneCourse.setDuration("25 heures");
            standaloneCourse.setEstimatedHours(25);
            standaloneCourse.setEnrolledCount(0);
            standaloneCourse = courseRepository.save(standaloneCourse);
            System.out.println("✅ Cours standalone créé : " + standaloneCourse.getTitle());
            
            // 5. Créer des formations supplémentaires
            createAdditionalFormations(trainer);
            
            // 6. Compléter les formations existantes avec du contenu
            completeExistingFormations(trainer);
            
            // 7. Créer des conversations et messages pour calculer les niveaux
            if (testUser != null) {
                createConversationsForLevels(testUser);
            }
            
            System.out.println("\n✅ Contenu de test créé avec succès !");
            System.out.println("   - Formations PUBLISHED");
            System.out.println("   - Modules PUBLISHED");
            System.out.println("   - Cours PUBLISHED");
            System.out.println("   - Contenu complet (leçons, labs, quiz) ajouté");
            System.out.println("   - Conversations et messages pour calcul des niveaux");
            System.out.println("   Les cours sont maintenant visibles dans le catalogue utilisateur.\n");
            
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la création du contenu de test : " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private void createAdditionalFormations(User trainer) {
        try {
            // Formation 2: Data Science
            Formation formation2 = new Formation();
            formation2.setTitle("Formation Data Science avec Python");
            formation2.setDescription("Maîtrisez la Data Science avec Python, Pandas, NumPy et Scikit-learn. Apprenez à analyser des données et créer des modèles prédictifs.");
            formation2.setCategory("Data Science");
            formation2.setLevel(Formation.Level.INTERMEDIAIRE);
            formation2.setDuration(100.0);
            formation2.setStatus(ContentStatus.PUBLISHED);
            formation2.setCreatedBy(trainer);
            // formation2.setThumbnail("https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800");
            formation2 = formationRepository.save(formation2);
            System.out.println("✅ Formation créée : " + formation2.getTitle());
            
            com.coachai.model.Module module2 = new com.coachai.model.Module();
            module2.setTitle("Module 1 : Python pour la Data Science");
            module2.setDescription("Introduction à Python et aux bibliothèques essentielles");
            module2.setFormation(formation2);
            module2.setOrder(1);
            module2.setDuration(30.0);
            module2.setStatus(ContentStatus.PUBLISHED);
            module2 = moduleRepository.save(module2);
            
            Course course3 = new Course();
            course3.setTitle("Python et Pandas pour l'Analyse de Données");
            course3.setSubtitle("Manipulez et analysez des données efficacement");
            course3.setDescription("Apprenez à utiliser Python et Pandas pour analyser des datasets réels.");
            course3.setLongDescription("Ce cours vous enseignera les fondamentaux de l'analyse de données avec Python.");
            course3.setCategory("Data Science");
            course3.setLevel(Course.Level.INTERMEDIAIRE);
            course3.setInstructorName(trainer.getFirstName() + " " + trainer.getLastName());
            course3.setInstructorTitle("Data Scientist");
            course3.setThumbnailUrl("https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800");
            course3.setModule(module2);
            course3.setStatus(ContentStatus.PUBLISHED);
            course3.setCreatedBy(trainer);
            course3.setDuration("20 heures");
            course3.setEstimatedHours(20);
            course3.setEnrolledCount(0);
            course3.setOrder(1); // Ajouter l'ordre
            course3 = courseRepository.save(course3);
            System.out.println("✅ Cours créé : " + course3.getTitle());
            
            // Ajouter du contenu complet au cours 3
            addCompleteContentToCourse(course3, trainer);
            
            // Formation 3: Machine Learning
            Formation formation3 = new Formation();
            formation3.setTitle("Machine Learning et Intelligence Artificielle");
            formation3.setDescription("Découvrez le Machine Learning et créez vos premiers modèles d'IA avec TensorFlow et Keras.");
            formation3.setCategory("Data Science");
            formation3.setLevel(Formation.Level.AVANCE);
            formation3.setDuration(150.0);
            formation3.setStatus(ContentStatus.PUBLISHED);
            formation3.setCreatedBy(trainer);
            // formation3.setThumbnail("https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800");
            formation3 = formationRepository.save(formation3);
            System.out.println("✅ Formation créée : " + formation3.getTitle());
            
            com.coachai.model.Module module3 = new com.coachai.model.Module();
            module3.setTitle("Module 1 : Introduction au Machine Learning");
            module3.setDescription("Les bases du Machine Learning");
            module3.setFormation(formation3);
            module3.setOrder(1);
            module3.setDuration(40.0);
            module3.setStatus(ContentStatus.PUBLISHED);
            module3 = moduleRepository.save(module3);
            
            Course course4 = new Course();
            course4.setTitle("Machine Learning avec Scikit-learn");
            course4.setSubtitle("Créez vos premiers modèles prédictifs");
            course4.setDescription("Apprenez les algorithmes de Machine Learning et leur implémentation avec Scikit-learn.");
            course4.setLongDescription("Ce cours vous guidera à travers les algorithmes fondamentaux du Machine Learning.");
            course4.setCategory("Data Science");
            course4.setLevel(Course.Level.AVANCE);
            course4.setInstructorName(trainer.getFirstName() + " " + trainer.getLastName());
            course4.setInstructorTitle("Expert en IA");
            course4.setThumbnailUrl("https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800");
            course4.setModule(module3);
            course4.setStatus(ContentStatus.PUBLISHED);
            course4.setCreatedBy(trainer);
            course4.setDuration("30 heures");
            course4.setEstimatedHours(30);
            course4.setEnrolledCount(0);
            course4.setOrder(1); // Ajouter l'ordre
            course4 = courseRepository.save(course4);
            System.out.println("✅ Cours créé : " + course4.getTitle());
            
            // Ajouter du contenu complet au cours 4
            addCompleteContentToCourse(course4, trainer);
            
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la création des formations supplémentaires : " + e.getMessage());
        }
    }
    
    private void createConversationsForLevels(User user) {
        try {
            // Créer des conversations avec différents niveaux d'activité pour tester le Gradient Boosting
            String[] conversationTitles = {
                "Questions sur JavaScript",
                "Aide avec React",
                "Problèmes de CSS",
                "Compréhension des hooks",
                "Optimisation de performance"
            };
            
            String[][] messages = {
                {"Qu'est-ce qu'une closure en JavaScript ?", "Une closure est une fonction qui a accès aux variables de son environnement lexical."},
                {"Comment utiliser useState dans React ?", "useState est un hook qui permet de gérer l'état local d'un composant."},
                {"Comment centrer un élément avec CSS ?", "Vous pouvez utiliser flexbox, grid, ou margin: auto."},
                {"Quelle est la différence entre useEffect et useMemo ?", "useEffect gère les effets de bord, useMemo mémorise des valeurs calculées."},
                {"Comment optimiser les performances d'une application React ?", "Utilisez React.memo, useMemo, useCallback et code splitting."}
            };
            
            for (int i = 0; i < conversationTitles.length; i++) {
                Conversation conv = new Conversation();
                conv.setUser(user);
                conv.setTitle(conversationTitles[i]);
                conv.setActive(true);
                conv.setMessagesCount(0);
                conv = conversationRepository.save(conv);
                
                // Créer des messages pour cette conversation
                for (int j = 0; j < messages[i].length; j++) {
                    ChatMessage msg = new ChatMessage();
                    msg.setConversation(conv);
                    msg.setContent(messages[i][j]);
                    msg.setSender(j % 2 == 0 ? ChatMessage.MessageSender.USER : ChatMessage.MessageSender.AI);
                    msg.setRead(false);
                    chatMessageRepository.save(msg);
                }
                
                // Mettre à jour la conversation
                conv.setLastMessage(messages[i][messages[i].length - 1]);
                conv.setLastMessageDate(java.time.LocalDateTime.now().minusDays(i));
                conv.setMessagesCount(messages[i].length);
                conversationRepository.save(conv);
            }
            
            System.out.println("✅ Conversations créées pour le calcul des niveaux");
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la création des conversations : " + e.getMessage());
        }
    }
    
    private void fixChatMessagesReadColumn() {
        try {
            // Update NULL values to false
            int updated = jdbcTemplate.update("UPDATE chat_messages SET \"read\" = false WHERE \"read\" IS NULL");
            if (updated > 0) {
                System.out.println("✅ Corrigé " + updated + " messages avec read = NULL");
            }
        } catch (Exception e) {
            System.err.println("⚠️  Erreur lors de la correction de la colonne read : " + e.getMessage());
            // Continue anyway - the column might not exist yet or might already be fixed
        }
        
        try {
            // Fix AICoachSession ID type if needed
            jdbcTemplate.execute("ALTER TABLE ai_coach_sessions ALTER COLUMN id TYPE uuid USING id::uuid");
            System.out.println("✅ Type de colonne ai_coach_sessions.id corrigé");
        } catch (Exception e) {
            // Column might already be correct type or table doesn't exist yet
            System.err.println("⚠️  Erreur lors de la correction du type de colonne ai_coach_sessions.id : " + e.getMessage());
        }
    }
    
    /**
     * Complète toutes les formations existantes qui n'ont pas encore de contenu
     */
    private void completeExistingFormations(User trainer) {
        try {
            System.out.println("\n📚 Vérification et complétion des formations existantes...");
            
            // Récupérer toutes les formations publiées
            List<Formation> formations = formationRepository.findByStatus(ContentStatus.PUBLISHED);
            
            if (formations == null || formations.isEmpty()) {
                System.out.println("   ℹ️  Aucune formation publiée trouvée.");
                return;
            }
            
            int completedCount = 0;
            int modulesCompletedCount = 0;
            
            for (Formation formation : formations) {
                // Récupérer les modules de la formation
                List<com.coachai.model.Module> modules = moduleRepository.findByFormationOrderByOrderAsc(formation);
                
                if (modules == null || modules.isEmpty()) {
                    // Si pas de modules, créer un module par défaut
                    System.out.println("   📝 Création d'un module pour la formation : " + formation.getTitle());
                    com.coachai.model.Module newModule = new com.coachai.model.Module();
                    newModule.setTitle("Module 1 : Introduction");
                    newModule.setDescription("Module d'introduction à " + formation.getTitle());
                    newModule.setFormation(formation);
                    newModule.setOrder(1);
                    newModule.setDuration(10.0);
                    newModule.setStatus(ContentStatus.PUBLISHED);
                    newModule.setCreatedBy(trainer);
                    newModule = moduleRepository.save(newModule);
                    modules = List.of(newModule);
                }
                
                boolean formationHasContent = false;
                
                // Vérifier chaque module pour la nouvelle architecture (textContent, videoUrl, labContent, quiz)
                for (com.coachai.model.Module module : modules) {
                    boolean moduleHasContent = false;
                    
                    // Vérifier si le module a du contenu dans la nouvelle architecture
                    if ((module.getTextContent() != null && !module.getTextContent().trim().isEmpty()) ||
                        (module.getVideoUrl() != null && !module.getVideoUrl().trim().isEmpty()) ||
                        (module.getLabContent() != null && !module.getLabContent().trim().isEmpty()) ||
                        (module.getQuiz() != null)) {
                        moduleHasContent = true;
                        formationHasContent = true;
                    }
                    
                    // Si le module n'a pas de contenu dans la nouvelle architecture, l'ajouter
                    if (!moduleHasContent) {
                        System.out.println("   📝 Ajout de contenu au module (nouvelle architecture) : " + module.getTitle());
                        addContentToModule(module, trainer);
                        modulesCompletedCount++;
                        formationHasContent = true;
                    }
                    
                    // Vérifier aussi l'ancienne architecture (cours avec leçons)
                    List<Course> courses = courseRepository.findByModuleOrderByOrderAsc(module);
                    
                    if (courses != null && !courses.isEmpty()) {
                        // Vérifier chaque cours
                        for (Course course : courses) {
                            // Vérifier si le cours a déjà des leçons
                            List<Lesson> existingLessons = lessonRepository.findByCourseOrderByOrderAsc(course);
                            
                            if (existingLessons == null || existingLessons.isEmpty()) {
                                // Le cours n'a pas de contenu, l'ajouter
                                System.out.println("   📝 Ajout de contenu au cours : " + course.getTitle());
                                addCompleteContentToCourse(course, trainer);
                                completedCount++;
                                formationHasContent = true;
                            } else {
                                formationHasContent = true;
                            }
                        }
                    }
                }
                
                if (formationHasContent) {
                    System.out.println("   ✅ Formation complétée : " + formation.getTitle());
                }
            }
            
            if (completedCount > 0 || modulesCompletedCount > 0) {
                System.out.println("   ✅ " + completedCount + " cours(s) et " + modulesCompletedCount + " module(s) complété(s) avec du contenu.");
            } else {
                System.out.println("   ℹ️  Toutes les formations ont déjà du contenu.");
            }
            
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la complétion des formations existantes : " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Ajoute du contenu complet à un module dans la nouvelle architecture (textContent, videoUrl, labContent, quiz)
     */
    private void addContentToModule(com.coachai.model.Module module, User trainer) {
        try {
            // 1. Ajouter du contenu texte
            String textContent = "# " + module.getTitle() + "\n\n" +
                "## Introduction\n\n" +
                "Bienvenue dans ce module ! Ce module vous permettra de maîtriser les concepts fondamentaux.\n\n" +
                "## Objectifs d'apprentissage\n\n" +
                "- Comprendre les concepts de base\n" +
                "- Appliquer les connaissances acquises\n" +
                "- Évaluer votre compréhension\n\n" +
                "## Contenu détaillé\n\n" +
                "Dans cette section, nous allons explorer en profondeur les différents aspects de " + module.getTitle() + ".\n\n" +
                "### Section 1 : Les bases\n\n" +
                "Commençons par les concepts fondamentaux qui vous serviront de fondation pour la suite.\n\n" +
                "### Section 2 : Applications pratiques\n\n" +
                "Nous verrons comment appliquer ces concepts dans des situations réelles.\n\n" +
                "## Conclusion\n\n" +
                "À la fin de ce module, vous aurez acquis une solide compréhension des concepts présentés.";
            
            module.setTextContent(textContent);
            
            // 2. Ajouter une URL vidéo
            module.setVideoUrl("https://www.youtube.com/embed/dQw4w9WgXcQ");
            
            // 3. Ajouter du contenu de lab
            String labContent = "# Lab Pratique : " + module.getTitle() + "\n\n" +
                "## Instructions\n\n" +
                "Dans ce laboratoire pratique, vous allez mettre en application les concepts appris dans ce module.\n\n" +
                "## Objectifs\n\n" +
                "1. Créer un projet de base\n" +
                "2. Implémenter les fonctionnalités principales\n" +
                "3. Tester votre solution\n" +
                "4. Soumettre votre travail\n\n" +
                "## Étapes à suivre\n\n" +
                "### Étape 1 : Préparation\n\n" +
                "Créez un nouveau projet et configurez l'environnement de développement.\n\n" +
                "### Étape 2 : Implémentation\n\n" +
                "Implémentez les fonctionnalités demandées en suivant les bonnes pratiques.\n\n" +
                "### Étape 3 : Tests\n\n" +
                "Testez votre solution pour vous assurer qu'elle fonctionne correctement.\n\n" +
                "### Étape 4 : Soumission\n\n" +
                "Soumettez votre code et vos résultats pour évaluation.\n\n" +
                "## Ressources\n\n" +
                "- Documentation officielle\n" +
                "- Exemples de code\n" +
                "- Forum de discussion";
            
            module.setLabContent(labContent);
            
            // 4. Créer un quiz pour le module
            Quiz quiz = new Quiz();
            quiz.setModule(module);
            quiz.setTitle("Quiz : Évaluation " + module.getTitle());
            quiz.setDescription("Testez vos connaissances avec ce quiz à choix multiples.");
            quiz.setDifficulty(Quiz.DifficultyLevel.MOYEN);
            quiz.setDuration(30); // 30 minutes
            quiz.setPassingScore(70); // 70% minimum
            quiz.setMaxAttempts(3);
            quiz.setGraded(true);
            quiz.setStatus(ContentStatus.PUBLISHED);
            quiz.setCreatedBy(trainer);
            quiz = quizRepository.save(quiz);
            
            // Créer des questions QCM pour le quiz
            String[][] questions = {
                {"Quel est l'objectif principal de " + module.getTitle() + " ?", 
                 "Apprendre les bases", "Maîtriser les concepts avancés", "Comprendre les applications pratiques", "Toutes les réponses", "3"},
                {"Quelle est la meilleure approche pour apprendre ce module ?", 
                 "Lire rapidement", "Pratiquer régulièrement", "Mémoriser par cœur", "Éviter les exercices", "1"},
                {"Quand pouvez-vous considérer que vous avez maîtrisé ce module ?", 
                 "Après avoir lu le texte", "Après avoir regardé la vidéo", "Après avoir complété le lab et réussi le quiz", "Jamais", "2"}
            };
            
            for (int i = 0; i < questions.length; i++) {
                QuizQuestion question = new QuizQuestion();
                question.setQuiz(quiz);
                question.setQuestionNumber(i + 1);
                question.setType(QuizQuestion.QuestionType.MULTIPLE_CHOICE);
                question.setQuestion(questions[i][0]);
                question.setPoints(10);
                question.setOrder(i + 1);
                question.setCorrectAnswer(questions[i][4]); // Index de la bonne réponse
                question = quizQuestionRepository.save(question);
                
                // Créer les options pour chaque question
                for (int j = 1; j <= 4; j++) {
                    QuizOption option = new QuizOption();
                    option.setQuestion(question);
                    option.setText(questions[i][j]);
                    option.setCorrect(j == Integer.parseInt(questions[i][4]));
                    quizOptionRepository.save(option);
                }
            }
            
            // Sauvegarder le module avec le quiz
            module = moduleRepository.save(module);
            
            System.out.println("   ✅ Contenu ajouté au module : " + module.getTitle());
            System.out.println("      - Contenu texte ajouté");
            System.out.println("      - URL vidéo ajoutée");
            System.out.println("      - Contenu de lab ajouté");
            System.out.println("      - Quiz créé avec " + questions.length + " questions");
            
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'ajout de contenu au module " + module.getTitle() + " : " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Ajoute du contenu complet à un cours : leçons (texte, vidéo), exercices (lab) et quiz (QCM)
     */
    private void addCompleteContentToCourse(Course course, User trainer) {
        try {
            // 1. Créer des leçons (TEXTE et VIDEO)
            // Leçon 1 : Texte (Lecture)
            Lesson lesson1 = new Lesson();
            lesson1.setCourse(course);
            lesson1.setLessonNumber(1);
            lesson1.setType(Lesson.LessonType.LECTURE);
            lesson1.setTitle("Introduction à " + course.getTitle());
            lesson1.setDescription("Cette leçon vous introduit aux concepts fondamentaux de " + course.getTitle() + ".");
            lesson1.setDuration(15);
            lesson1.setContentUrl("https://example.com/content/intro.pdf");
            lesson1.setOrder(1);
            lesson1.setCreatedBy(trainer);
            lesson1.setMandatory(true);
            lesson1 = lessonRepository.save(lesson1);
            System.out.println("   ✅ Leçon texte créée : " + lesson1.getTitle());
            
            // Leçon 2 : Vidéo
            Lesson lesson2 = new Lesson();
            lesson2.setCourse(course);
            lesson2.setLessonNumber(2);
            lesson2.setType(Lesson.LessonType.VIDEO);
            lesson2.setTitle("Vidéo : Premiers pas avec " + course.getTitle());
            lesson2.setDescription("Regardez cette vidéo pour comprendre les bases pratiques.");
            lesson2.setDuration(20);
            lesson2.setVideoUrl("https://example.com/videos/intro.mp4");
            lesson2.setTranscript("Dans cette vidéo, nous allons explorer les concepts de base...");
            lesson2.setOrder(2);
            lesson2.setCreatedBy(trainer);
            lesson2.setMandatory(true);
            lesson2 = lessonRepository.save(lesson2);
            // Vérifier que la leçon est bien sauvegardée
            if (lesson2.getId() != null) {
                System.out.println("   ✅ Leçon vidéo créée et sauvegardée (ID: " + lesson2.getId() + ") : " + lesson2.getTitle());
            } else {
                System.err.println("   ❌ Erreur : La leçon vidéo n'a pas été sauvegardée");
            }
            
            // Leçon 3 : Texte supplémentaire
            Lesson lesson3 = new Lesson();
            lesson3.setCourse(course);
            lesson3.setLessonNumber(3);
            lesson3.setType(Lesson.LessonType.LECTURE);
            lesson3.setTitle("Concepts avancés");
            lesson3.setDescription("Approfondissez vos connaissances avec cette lecture.");
            lesson3.setDuration(25);
            lesson3.setContentUrl("https://example.com/content/advanced.pdf");
            lesson3.setOrder(3);
            lesson3.setCreatedBy(trainer);
            lesson3.setMandatory(true);
            lesson3 = lessonRepository.save(lesson3);
            // Vérifier que la leçon est bien sauvegardée
            if (lesson3.getId() != null) {
                System.out.println("   ✅ Leçon texte créée et sauvegardée (ID: " + lesson3.getId() + ") : " + lesson3.getTitle());
            } else {
                System.err.println("   ❌ Erreur : La leçon n'a pas été sauvegardée");
            }
            
            // 2. Créer un exercice (LAB)
            Exercise lab = new Exercise();
            lab.setCourse(course);
            lab.setTitle("Lab pratique : Exercice " + course.getTitle());
            lab.setDescription("Mettez en pratique ce que vous avez appris avec cet exercice pratique.");
            lab.setInstructions("Suivez les étapes suivantes :\n1. Créez un nouveau projet\n2. Implémentez les fonctionnalités de base\n3. Testez votre solution\n4. Soumettez votre code");
            lab.setType(Exercise.ExerciseType.PRATIQUE);
            lab.setDifficulty(Exercise.DifficultyLevel.MOYEN);
            lab.setEstimatedTime(60); // 60 minutes
            lab.setStatus(ContentStatus.PUBLISHED);
            lab.setCreatedBy(trainer);
            lab = exerciseRepository.save(lab);
            // Vérifier que le lab est bien sauvegardé
            if (lab.getId() != null) {
                System.out.println("   ✅ Lab créé et sauvegardé (ID: " + lab.getId() + ") : " + lab.getTitle());
            } else {
                System.err.println("   ❌ Erreur : Le lab n'a pas été sauvegardé");
            }
            
            // Lier le lab à la leçon 2
            lesson2.setExercise(lab);
            lesson2 = lessonRepository.save(lesson2);
            System.out.println("   ✅ Lab lié à la leçon vidéo");
            
            // 3. Créer un quiz QCM
            Quiz quiz = new Quiz();
            quiz.setCourse(course);
            quiz.setTitle("Quiz : Évaluation " + course.getTitle());
            quiz.setDescription("Testez vos connaissances avec ce quiz à choix multiples.");
            quiz.setDifficulty(Quiz.DifficultyLevel.MOYEN);
            quiz.setDuration(30); // 30 minutes
            quiz.setPassingScore(60); // 60% minimum
            quiz.setMaxAttempts(3);
            quiz.setGraded(true);
            quiz.setStatus(ContentStatus.PUBLISHED);
            quiz.setCreatedBy(trainer);
            quiz = quizRepository.save(quiz);
            // Vérifier que le quiz est bien sauvegardé
            if (quiz.getId() != null) {
                System.out.println("   ✅ Quiz créé et sauvegardé (ID: " + quiz.getId() + ") : " + quiz.getTitle());
            } else {
                System.err.println("   ❌ Erreur : Le quiz n'a pas été sauvegardé");
            }
            
            // Créer des questions QCM pour le quiz
            String[][] questions = {
                {"Qu'est-ce que " + course.getTitle() + " ?", 
                 "Une technologie moderne", "Un concept fondamental", "Une méthode avancée", "Toutes les réponses", "3"},
                {"Quel est l'avantage principal de " + course.getTitle() + " ?",
                 "La simplicité", "La performance", "La flexibilité", "Tous les avantages", "3"},
                {"Quand utiliser " + course.getTitle() + " ?",
                 "Pour les projets simples", "Pour les projets complexes", "Dans tous les cas", "Jamais", "2"}
            };
            
            for (int i = 0; i < questions.length; i++) {
                QuizQuestion question = new QuizQuestion();
                question.setQuiz(quiz);
                question.setQuestionNumber(i + 1);
                question.setType(QuizQuestion.QuestionType.MULTIPLE_CHOICE);
                question.setQuestion(questions[i][0]);
                question.setPoints(10);
                question.setOrder(i + 1);
                question.setCorrectAnswer(questions[i][4]); // Index de la bonne réponse
                question = quizQuestionRepository.save(question);
                
                // Créer les options pour chaque question
                for (int j = 1; j <= 4; j++) {
                    QuizOption option = new QuizOption();
                    option.setQuestion(question);
                    option.setText(questions[i][j]);
                    option.setCorrect(j == Integer.parseInt(questions[i][4]));
                    option = quizOptionRepository.save(option);
                    if (option.getId() == null) {
                        System.err.println("   ❌ Erreur : L'option n'a pas été sauvegardée");
                    }
                }
            }
            System.out.println("   ✅ " + questions.length + " questions QCM créées et sauvegardées pour le quiz");
            
            // Lier le quiz à la leçon 3
            lesson3.setQuiz(quiz);
            lesson3 = lessonRepository.save(lesson3);
            System.out.println("   ✅ Quiz lié à la leçon avancée");
            
            // Vérification finale : recharger le cours depuis la base de données
            Course savedCourse = courseRepository.findById(course.getId()).orElse(null);
            if (savedCourse != null) {
                List<Lesson> finalLessons = lessonRepository.findByCourseOrderByOrderAsc(savedCourse);
                System.out.println("   ✅ Vérification finale : " + (finalLessons != null ? finalLessons.size() : 0) + " leçon(s) trouvée(s) dans la base de données");
            }
            
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'ajout de contenu au cours " + course.getTitle() + " : " + e.getMessage());
            e.printStackTrace();
        }
    }
}

