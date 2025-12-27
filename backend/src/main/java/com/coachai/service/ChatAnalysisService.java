package com.coachai.service;

import com.coachai.model.*;
import com.coachai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service pour analyser les conversations IA et générer des recommandations
 * basées sur les topics détectés dans les messages
 */
@Service
public class ChatAnalysisService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private AIRecommendationRepository aiRecommendationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FormationRepository formationRepository;

    @Autowired
    private AiService aiService;

    // Seuil minimum de questions pour déclencher une recommandation
    private static final int MIN_QUESTIONS_THRESHOLD = 5;

    // Topics courants à détecter (peut être étendu)
    private static final Map<String, List<String>> TOPIC_KEYWORDS = new HashMap<>();
    
    static {
        // Java
        TOPIC_KEYWORDS.put("Java", Arrays.asList("java", "jvm", "spring", "hibernate", "maven", "gradle"));
        // Python
        TOPIC_KEYWORDS.put("Python", Arrays.asList("python", "django", "flask", "numpy", "pandas", "pytest"));
        // JavaScript
        TOPIC_KEYWORDS.put("JavaScript", Arrays.asList("javascript", "js", "node", "react", "vue", "angular", "typescript"));
        // Web Development
        TOPIC_KEYWORDS.put("Développement Web", Arrays.asList("html", "css", "web", "frontend", "backend", "api", "rest"));
        // Database
        TOPIC_KEYWORDS.put("Base de données", Arrays.asList("sql", "database", "mysql", "postgresql", "mongodb", "nosql"));
        // Algorithms
        TOPIC_KEYWORDS.put("Algorithmes", Arrays.asList("algorithme", "algorithm", "structure", "complexité", "tri", "recherche"));
    }

    /**
     * Analyse les conversations d'un étudiant et détecte les topics dominants
     * Utilise l'API Python pour une détection contextuelle améliorée
     * @param student L'étudiant à analyser
     * @return Map avec les topics détectés et leur fréquence
     */
    public Map<String, Integer> analyzeChatTopics(User student) {
        Map<String, Integer> topicCounts = new HashMap<>();
        
        List<Conversation> conversations = conversationRepository.findByUser(student);
        List<String> userMessages = new ArrayList<>();
        
        // Collecter tous les messages de l'utilisateur
        for (Conversation conv : conversations) {
            List<ChatMessage> messages = chatMessageRepository.findByConversationOrderByTimestampAsc(conv);
            for (ChatMessage message : messages) {
                if (message.getSender() == ChatMessage.MessageSender.USER) {
                    userMessages.add(message.getContent());
                }
            }
        }
        
        // Utiliser l'API Python pour la détection de topics si on a au moins 5 questions
        if (userMessages.size() >= MIN_QUESTIONS_THRESHOLD) {
            try {
                AiService.TopicDetectionResponse response = aiService.detectTopics(userMessages);
                if (response != null && response.getTopics() != null) {
                    topicCounts = response.getTopics();
                }
            } catch (Exception e) {
                System.err.println("Erreur lors de la détection de topics via API: " + e.getMessage());
                // Fallback sur la détection locale
                topicCounts = analyzeChatTopicsLocal(userMessages);
            }
        } else {
            // Fallback sur la détection locale si pas assez de messages
            topicCounts = analyzeChatTopicsLocal(userMessages);
        }
        
        return topicCounts;
    }

    /**
     * Détection locale de topics (fallback)
     */
    private Map<String, Integer> analyzeChatTopicsLocal(List<String> userMessages) {
        Map<String, Integer> topicCounts = new HashMap<>();
        
        for (String message : userMessages) {
            String content = message.toLowerCase();
            
            // Détecter les topics
            for (Map.Entry<String, List<String>> entry : TOPIC_KEYWORDS.entrySet()) {
                String topic = entry.getKey();
                List<String> keywords = entry.getValue();
                
                for (String keyword : keywords) {
                    if (content.contains(keyword.toLowerCase())) {
                        topicCounts.merge(topic, 1, Integer::sum);
                        break; // Compter une seule fois par message
                    }
                }
            }
        }
        
        return topicCounts;
    }

    /**
     * Génère des recommandations IA basées sur l'analyse des conversations
     * Si un topic est mentionné >= 10 fois, génère une recommandation
     * @param student L'étudiant à analyser
     * @return Liste des recommandations générées
     */
    public List<AIRecommendation> generateRecommendationsFromChat(User student) {
        List<AIRecommendation> recommendations = new ArrayList<>();
        
        // Analyser les topics dans les conversations
        Map<String, Integer> topicCounts = analyzeChatTopics(student);
        
        // Générer une recommandation pour chaque topic qui dépasse le seuil
        for (Map.Entry<String, Integer> entry : topicCounts.entrySet()) {
            String topic = entry.getKey();
            int messageCount = entry.getValue();
            
            if (messageCount >= MIN_QUESTIONS_THRESHOLD) {
                // Vérifier si une recommandation similaire existe déjà
                if (!recommendationExistsForTopic(student, topic)) {
                    AIRecommendation recommendation = createRecommendation(student, topic, messageCount);
                    recommendations.add(recommendation);
                }
            }
        }
        
        // Sauvegarder les recommandations
        if (!recommendations.isEmpty()) {
            aiRecommendationRepository.saveAll(recommendations);
        }
        
        return recommendations;
    }

    /**
     * Crée une recommandation pour un topic donné
     */
    private AIRecommendation createRecommendation(User student, String topic, int messageCount) {
        AIRecommendation recommendation = new AIRecommendation();
        
        // Déterminer le type de recommandation et le titre
        String title = determineRecommendationTitle(topic);
        recommendation.setType(AIRecommendation.RecommendationType.FORMATION);
        recommendation.setTitle(title);
        recommendation.setDescription("Formation recommandée basée sur votre intérêt pour " + topic);
        
        // Justification basée sur l'analyse
        String justification = String.format(
            "Vous avez mentionné '%s' %d fois dans vos conversations avec l'IA. " +
            "Nous vous recommandons cette formation pour approfondir vos connaissances.",
            topic, messageCount
        );
        recommendation.setJustification(justification);
        
        // Données basées sur l'analyse
        recommendation.setBasedOn(Arrays.asList(
            "Analyse des conversations IA",
            "Topic détecté: " + topic,
            "Nombre de mentions: " + messageCount,
            "Seuil atteint: " + MIN_QUESTIONS_THRESHOLD + " questions"
        ));
        
        // Topics de conversation
        recommendation.setConversationTopics(Arrays.asList(topic));
        
        // Étudiant ciblé
        recommendation.setTargetStudents(Arrays.asList(student.getId()));
        
        // Priorité basée sur le nombre de mentions
        if (messageCount >= 20) {
            recommendation.setPriority(AIRecommendation.Priority.HIGH);
        } else if (messageCount >= 15) {
            recommendation.setPriority(AIRecommendation.Priority.MEDIUM);
        } else {
            recommendation.setPriority(AIRecommendation.Priority.MEDIUM);
        }
        
        recommendation.setStatus(AIRecommendation.RecommendationStatus.PENDING);
        recommendation.setStudentCount(1);
        recommendation.setCreatedAt(LocalDateTime.now());
        
        return recommendation;
    }

    /**
     * Détermine le titre de la recommandation basé sur le topic
     */
    private String determineRecommendationTitle(String topic) {
        Map<String, String> titleMap = new HashMap<>();
        titleMap.put("Java", "Java Avancé");
        titleMap.put("Python", "Python Avancé");
        titleMap.put("JavaScript", "JavaScript Avancé");
        titleMap.put("Développement Web", "Développement Web Avancé");
        titleMap.put("Base de données", "Bases de données Avancées");
        titleMap.put("Algorithmes", "Algorithmes et Structures de Données");
        
        return titleMap.getOrDefault(topic, topic + " - Formation Avancée");
    }

    /**
     * Vérifie si une recommandation existe déjà pour ce topic et cet étudiant
     */
    private boolean recommendationExistsForTopic(User student, String topic) {
        List<AIRecommendation> existing = aiRecommendationRepository.findAll();
        
        for (AIRecommendation rec : existing) {
            // Vérifier si la recommandation concerne le même étudiant et le même topic
            if (rec.getTargetStudents().contains(student.getId()) &&
                rec.getConversationTopics().contains(topic) &&
                (rec.getStatus() == AIRecommendation.RecommendationStatus.PENDING ||
                 rec.getStatus() == AIRecommendation.RecommendationStatus.APPROVED)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Analyse toutes les conversations et génère des recommandations pour tous les étudiants
     * qui ont atteint le seuil
     */
    public void analyzeAllStudentsAndGenerateRecommendations() {
        List<User> students = userRepository.findByRole(User.UserRole.USER);
        
        for (User student : students) {
            try {
                List<AIRecommendation> recommendations = generateRecommendationsFromChat(student);
                if (!recommendations.isEmpty()) {
                    System.out.println("Généré " + recommendations.size() + 
                        " recommandation(s) pour l'étudiant: " + student.getEmail());
                }
            } catch (Exception e) {
                System.err.println("Erreur lors de l'analyse pour l'étudiant " + 
                    student.getEmail() + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    /**
     * Récupère les statistiques d'analyse pour un étudiant
     */
    public Map<String, Object> getAnalysisStats(User student) {
        Map<String, Object> stats = new HashMap<>();
        
        List<Conversation> conversations = conversationRepository.findByUser(student);
        stats.put("totalConversations", conversations.size());
        
        long totalMessages = 0;
        long userMessages = 0;
        for (Conversation conv : conversations) {
            List<ChatMessage> messages = chatMessageRepository.findByConversationOrderByTimestampAsc(conv);
            totalMessages += messages.size();
            userMessages += messages.stream()
                .filter(m -> m.getSender() == ChatMessage.MessageSender.USER)
                .count();
        }
        
        stats.put("totalMessages", totalMessages);
        stats.put("userMessages", userMessages);
        
        Map<String, Integer> topicCounts = analyzeChatTopics(student);
        stats.put("topicCounts", topicCounts);
        
        // Topics qui ont atteint le seuil
        List<String> topicsAboveThreshold = topicCounts.entrySet().stream()
            .filter(e -> e.getValue() >= MIN_QUESTIONS_THRESHOLD)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
        stats.put("topicsAboveThreshold", topicsAboveThreshold);
        
        return stats;
    }
}

