package com.coachai.service;

import com.coachai.model.*;
import com.coachai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service pour générer des recommandations de formations basées sur
 * l'analyse ML du niveau d'étudiant et les spécialités détectées
 */
@Service
public class FormationRecommendationService {

    @Autowired
    private StudentLevelAnalysisService studentLevelAnalysisService;

    @Autowired
    private ChatAnalysisService chatAnalysisService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FormationRepository formationRepository;

    @Autowired
    private AIRecommendationRepository aiRecommendationRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private com.coachai.repository.UserNotificationRepository notificationRepository;

    /**
     * Génère une recommandation de formation pour un étudiant
     * basée sur son niveau ML et sa spécialité détectée
     */
    @Transactional
    public AIRecommendation generateFormationRecommendation(User student) {
        // 1. Prédire le niveau de l'étudiant avec le modèle ML
        Map<String, Object> levelPrediction = studentLevelAnalysisService.predictStudentLevel(student);
        String predictedLevel = (String) levelPrediction.get("predicted_level");
        Double confidence = ((Number) levelPrediction.get("confidence")).doubleValue();

        // 2. Détecter la spécialité dominante dans les conversations (analyse contextuelle améliorée)
        Map<String, Integer> topicCounts = chatAnalysisService.analyzeChatTopics(student);
        String specialty = detectDominantSpecialty(topicCounts);
        
        // Vérifier qu'on a au moins 5 questions dans le contexte
        int totalQuestions = topicCounts.values().stream().mapToInt(Integer::intValue).sum();
        if (totalQuestions < 5) {
            return null; // Pas assez de questions pour générer une recommandation
        }

        // 3. Vérifier si une recommandation similaire existe déjà
        if (recommendationExists(student, specialty, predictedLevel)) {
            return null; // Recommandation déjà existante
        }

        // 4. Créer la recommandation
        AIRecommendation recommendation = new AIRecommendation();
        recommendation.setType(AIRecommendation.RecommendationType.FORMATION);
        recommendation.setTitle(generateFormationTitle(specialty, predictedLevel));
        recommendation.setDescription(generateDescription(specialty, predictedLevel, confidence));
        recommendation.setJustification(generateJustification(student, specialty, predictedLevel, confidence, topicCounts));
        
        // Données basées sur l'analyse ML
        recommendation.setLevel(predictedLevel);
        recommendation.setSpecialty(specialty);
        recommendation.setDifficultyDetected(mapLevelToDifficulty(predictedLevel));
        
        // Topics de conversation
        List<String> topics = new ArrayList<>(topicCounts.keySet());
        recommendation.setConversationTopics(topics);
        
        // Étudiant ciblé
        recommendation.setTargetStudents(Arrays.asList(student.getId()));
        
        // Priorité basée sur la confiance et le nombre de messages
        int totalMentions = topicCounts.values().stream().mapToInt(Integer::intValue).sum();
        if (confidence >= 0.8 && totalMentions >= 15) {
            recommendation.setPriority(AIRecommendation.Priority.HIGH);
        } else if (confidence >= 0.6 && totalMentions >= 10) {
            recommendation.setPriority(AIRecommendation.Priority.MEDIUM);
        } else {
            recommendation.setPriority(AIRecommendation.Priority.LOW);
        }
        
        recommendation.setStatus(AIRecommendation.RecommendationStatus.PENDING);
        recommendation.setStudentCount(1);
        recommendation.setCreatedAt(LocalDateTime.now());

        // Données utilisées pour la recommandation
        List<String> basedOn = new ArrayList<>();
        basedOn.add("Analyse ML du niveau d'étudiant: " + predictedLevel + " (confiance: " + 
                   String.format("%.1f%%", confidence * 100) + ")");
        basedOn.add("Spécialité détectée: " + specialty);
        basedOn.add("Nombre total de mentions: " + totalMentions);
        basedOn.add("Topics analysés: " + String.join(", ", topics));
        recommendation.setBasedOn(basedOn);

        // Sauvegarder la recommandation
        return aiRecommendationRepository.save(recommendation);
    }

    /**
     * Détecte la spécialité dominante dans les conversations
     */
    private String detectDominantSpecialty(Map<String, Integer> topicCounts) {
        if (topicCounts.isEmpty()) {
            return "Général";
        }

        // Trouver le topic avec le plus de mentions
        String dominantTopic = topicCounts.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("Général");

        // Mapper les topics aux spécialités de formation
        Map<String, String> topicToSpecialty = new HashMap<>();
        topicToSpecialty.put("Java", "Java");
        topicToSpecialty.put("Python", "Python");
        topicToSpecialty.put("JavaScript", "JavaScript");
        topicToSpecialty.put("Développement Web", "Développement Web");
        topicToSpecialty.put("Base de données", "Bases de données");
        topicToSpecialty.put("Algorithmes", "Algorithmes et Structures de Données");
        topicToSpecialty.put("Frontend", "Développement Frontend");
        topicToSpecialty.put("Java Framework", "Java Framework");
        topicToSpecialty.put("Database", "Bases de données");
        topicToSpecialty.put("OOP", "Programmation Orientée Objet");

        return topicToSpecialty.getOrDefault(dominantTopic, dominantTopic);
    }

    /**
     * Génère un titre de formation basé sur la spécialité et le niveau
     */
    private String generateFormationTitle(String specialty, String level) {
        String levelPrefix = "";
        switch (level) {
            case "DEBUTANT":
                levelPrefix = "Introduction à ";
                break;
            case "INTERMEDIAIRE":
                levelPrefix = "";
                break;
            case "AVANCE":
                levelPrefix = "Avancé - ";
                break;
            case "EXPERT":
                levelPrefix = "Expert - ";
                break;
        }
        
        return levelPrefix + specialty;
    }

    /**
     * Génère une description pour la recommandation
     */
    private String generateDescription(String specialty, String level, double confidence) {
        return String.format(
            "Formation recommandée en %s pour un niveau %s. " +
            "Cette recommandation est basée sur l'analyse ML de vos conversations " +
            "avec un niveau de confiance de %.1f%%.", 
            specialty, level, confidence * 100
        );
    }

    /**
     * Génère la justification détaillée
     */
    private String generateJustification(User student, String specialty, String level, 
                                         double confidence, Map<String, Integer> topicCounts) {
        StringBuilder justification = new StringBuilder();
        
        justification.append(String.format(
            "L'étudiant %s %s a été analysé par le modèle ML qui a prédit un niveau %s " +
            "avec une confiance de %.1f%%. ", 
            student.getFirstName(), student.getLastName(), level, confidence * 100
        ));
        
        if (!topicCounts.isEmpty()) {
            justification.append("Les conversations de l'étudiant révèlent un intérêt marqué pour: ");
            List<String> topTopics = topicCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(3)
                .map(e -> e.getKey() + " (" + e.getValue() + " mentions)")
                .collect(Collectors.toList());
            justification.append(String.join(", ", topTopics));
            justification.append(". ");
        }
        
        justification.append(String.format(
            "Nous recommandons donc une formation en %s adaptée au niveau %s.", 
            specialty, level
        ));
        
        return justification.toString();
    }

    /**
     * Mappe le niveau prédit à une difficulté
     */
    private String mapLevelToDifficulty(String level) {
        switch (level) {
            case "DEBUTANT":
                return "FACILE";
            case "INTERMEDIAIRE":
                return "MOYEN";
            case "AVANCE":
            case "EXPERT":
                return "DIFFICILE";
            default:
                return "MOYEN";
        }
    }

    /**
     * Vérifie si une recommandation similaire existe déjà
     */
    private boolean recommendationExists(User student, String specialty, String level) {
        List<AIRecommendation> existing = aiRecommendationRepository.findAll();
        
        for (AIRecommendation rec : existing) {
            if (rec.getTargetStudents().contains(student.getId()) &&
                rec.getSpecialty() != null && rec.getSpecialty().equals(specialty) &&
                rec.getLevel() != null && rec.getLevel().equals(level) &&
                (rec.getStatus() == AIRecommendation.RecommendationStatus.PENDING ||
                 rec.getStatus() == AIRecommendation.RecommendationStatus.APPROVED)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Analyse tous les étudiants et génère des recommandations
     */
    @Transactional
    public List<AIRecommendation> analyzeAllStudentsAndGenerateRecommendations() {
        List<AIRecommendation> allRecommendations = new ArrayList<>();
        List<User> students = userRepository.findByRole(User.UserRole.USER);
        
        for (User student : students) {
            try {
                // Vérifier si l'étudiant a suffisamment de conversations
                List<Conversation> conversations = conversationRepository.findByUser(student);
                if (conversations.isEmpty()) {
                    continue;
                }
                
                // Compter les messages de l'utilisateur
                long userMessageCount = 0;
                List<String> userMessages = new ArrayList<>();
                for (Conversation conv : conversations) {
                    List<ChatMessage> messages = chatMessageRepository.findByConversationOrderByTimestampAsc(conv);
                    List<String> convUserMessages = messages.stream()
                        .filter(m -> m.getSender() == ChatMessage.MessageSender.USER)
                        .map(ChatMessage::getContent)
                        .collect(Collectors.toList());
                    userMessageCount += convUserMessages.size();
                    userMessages.addAll(convUserMessages);
                }
                
                // Générer une recommandation seulement si l'étudiant a au moins 5 questions dans le contexte
                if (userMessageCount >= 5) {
                    AIRecommendation recommendation = generateFormationRecommendation(student);
                    if (recommendation != null) {
                        allRecommendations.add(recommendation);
                        System.out.println("✅ Recommandation générée pour " + student.getEmail() + 
                                         " - Spécialité: " + recommendation.getSpecialty() + 
                                         " - Niveau: " + recommendation.getLevel());
                    }
                }
            } catch (Exception e) {
                System.err.println("❌ Erreur lors de la génération de recommandation pour " + 
                                student.getEmail() + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        return allRecommendations;
    }

    /**
     * Récupère les recommandations pour un formateur filtrées par sa spécialité
     */
    public List<AIRecommendation> getRecommendationsForTrainer(User trainer) {
        // Récupérer toutes les recommandations en attente d'approbation
        List<AIRecommendation> allPending = aiRecommendationRepository.findAll().stream()
            .filter(rec -> rec.getStatus() == AIRecommendation.RecommendationStatus.PENDING)
            .collect(Collectors.toList());
        
        // Si le formateur a des spécialités définies, filtrer par spécialité
        if (trainer.getSpecialties() != null && !trainer.getSpecialties().trim().isEmpty()) {
            String[] trainerSpecialties = trainer.getSpecialties().split(",");
            List<String> specialtiesList = Arrays.stream(trainerSpecialties)
                .map(String::trim)
                .map(String::toLowerCase)
                .collect(Collectors.toList());
            
            return allPending.stream()
                .filter(rec -> {
                    String recSpecialty = rec.getSpecialty();
                    if (recSpecialty == null) return false;
                    
                    // Vérifier si la spécialité de la recommandation correspond à une spécialité du formateur
                    String recSpecialtyLower = recSpecialty.toLowerCase();
                    return specialtiesList.stream()
                        .anyMatch(trainerSpec -> recSpecialtyLower.contains(trainerSpec) || 
                                               trainerSpec.contains(recSpecialtyLower));
                })
                .collect(Collectors.toList());
        }
        
        // Si pas de spécialités définies, retourner toutes les recommandations
        return allPending;
    }

    /**
     * Trouve un formateur spécialisé dans la spécialité donnée
     */
    private User findTrainerBySpecialty(String specialty) {
        List<User> trainers = userRepository.findByRole(User.UserRole.TRAINER);
        
        if (specialty == null || specialty.trim().isEmpty()) {
            // Retourner le premier formateur disponible si pas de spécialité
            return trainers.isEmpty() ? null : trainers.get(0);
        }
        
        String specialtyLower = specialty.toLowerCase();
        
        // Chercher un formateur avec cette spécialité
        for (User trainer : trainers) {
            if (trainer.getSpecialties() != null && !trainer.getSpecialties().trim().isEmpty()) {
                String[] trainerSpecialties = trainer.getSpecialties().split(",");
                for (String trainerSpec : trainerSpecialties) {
                    if (trainerSpec.trim().toLowerCase().equals(specialtyLower) ||
                        specialtyLower.contains(trainerSpec.trim().toLowerCase()) ||
                        trainerSpec.trim().toLowerCase().contains(specialtyLower)) {
                        return trainer;
                    }
                }
            }
        }
        
        // Si aucun formateur spécialisé trouvé, retourner le premier disponible
        return trainers.isEmpty() ? null : trainers.get(0);
    }

    /**
     * Applique une recommandation (création d'une formation par le formateur)
     */
    @Transactional
    public Formation applyRecommendation(AIRecommendation recommendation, User trainer, 
                                        Map<String, Object> formationData) {
        // Créer la formation basée sur la recommandation
        Formation formation = new Formation();
        formation.setTitle(recommendation.getTitle());
        formation.setDescription(recommendation.getDescription());
        formation.setLevel(mapLevelToFormationLevel(recommendation.getLevel()));
        formation.setCategory(recommendation.getSpecialty());
        formation.setStatus(com.coachai.model.ContentStatus.PENDING); // En attente d'approbation admin
        formation.setCreatedBy(trainer);
        // Assigner automatiquement le formateur qui applique la recommandation
        formation.setAssignedTo(trainer);
        formation.setSubmittedForValidationAt(LocalDateTime.now());
        
        // Appliquer les données supplémentaires si fournies
        if (formationData != null) {
            if (formationData.containsKey("duration")) {
                formation.setDuration(((Number) formationData.get("duration")).doubleValue());
            }
            if (formationData.containsKey("objectives")) {
                @SuppressWarnings("unchecked")
                List<String> objectives = (List<String>) formationData.get("objectives");
                formation.setObjectives(objectives);
            }
        }
        
        // Mettre à jour le statut de la recommandation
        recommendation.setStatus(AIRecommendation.RecommendationStatus.APPROVED);
        recommendation.setApprovedBy(trainer);
        recommendation.setApprovedAt(LocalDateTime.now());
        aiRecommendationRepository.save(recommendation);
        
        // Assigner automatiquement le formateur qui applique la recommandation
        formation.setAssignedTo(trainer);
        
        Formation savedFormation = formationRepository.save(formation);
        
        // Créer des notifications pour les admins
        createAdminNotificationsForFormation(savedFormation, trainer);
        
        return savedFormation;
    }

    /**
     * Mappe le niveau ML au niveau de formation
     */
    private Formation.Level mapLevelToFormationLevel(String mlLevel) {
        switch (mlLevel) {
            case "DEBUTANT":
                return Formation.Level.DEBUTANT;
            case "INTERMEDIAIRE":
                return Formation.Level.INTERMEDIAIRE;
            case "AVANCE":
            case "EXPERT":
                return Formation.Level.AVANCE;
            default:
                return Formation.Level.INTERMEDIAIRE;
        }
    }

    /**
     * Crée des notifications pour les admins lorsqu'une formation est créée
     */
    private void createAdminNotificationsForFormation(Formation formation, User trainer) {
        List<User> admins = userRepository.findByRole(User.UserRole.ADMIN);
        
        for (User admin : admins) {
            com.coachai.model.UserNotification notification = new com.coachai.model.UserNotification();
            notification.setUser(admin);
            notification.setType(com.coachai.model.UserNotification.NotificationType.VALIDATION);
            notification.setTitle("Nouvelle formation en attente d'approbation");
            notification.setMessage(String.format(
                "Le formateur %s %s a créé une nouvelle formation '%s' basée sur une recommandation ML. " +
                "Veuillez l'examiner et l'approuver.",
                trainer.getFirstName(), trainer.getLastName(), formation.getTitle()
            ));
            notification.setPriority(com.coachai.model.UserNotification.NotificationPriority.HIGH);
            notification.setActionUrl("/admin/content/formations/" + formation.getId());
            notification.setCreatedBy("system");
            notification.setRead(false);
            
            notificationRepository.save(notification);
        }
        
        System.out.println("✅ Notifications créées pour " + admins.size() + " admin(s) concernant la formation: " + formation.getTitle());
    }
}

