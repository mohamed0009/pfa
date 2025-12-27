package com.coachai.service;

import com.coachai.model.*;
import com.coachai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service pour analyser le niveau d'un étudiant en utilisant le modèle ML
 * basé sur ses conversations dans le chat
 */
@Service
public class StudentLevelAnalysisService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Value("${ml.model.url:http://localhost:8000}")
    private String mlModelUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Calcule les features d'un étudiant pour la prédiction du niveau
     */
    public Map<String, Object> calculateStudentFeatures(User student) {
        Map<String, Object> features = new HashMap<>();

        // Récupérer toutes les conversations de l'étudiant
        List<Conversation> conversations = conversationRepository.findByUser(student);
        
        // Calculer les métriques de conversation
        int totalConversations = conversations.size();
        int totalMessages = 0;
        int userMessages = 0;
        int totalMessageLength = 0;
        List<String> allUserMessages = new ArrayList<>();
        Set<String> uniqueTopics = new HashSet<>();
        
        LocalDateTime firstMessageDate = null;
        LocalDateTime lastMessageDate = null;
        List<LocalDateTime> messageDates = new ArrayList<>();

        for (Conversation conv : conversations) {
            List<ChatMessage> messages = chatMessageRepository.findByConversationOrderByTimestampAsc(conv);
            totalMessages += messages.size();
            
            for (ChatMessage msg : messages) {
                if (msg.getSender() == ChatMessage.MessageSender.USER) {
                    userMessages++;
                    String content = msg.getContent();
                    totalMessageLength += content.length();
                    allUserMessages.add(content);
                    messageDates.add(msg.getTimestamp());
                    
                    if (firstMessageDate == null || msg.getTimestamp().isBefore(firstMessageDate)) {
                        firstMessageDate = msg.getTimestamp();
                    }
                    if (lastMessageDate == null || msg.getTimestamp().isAfter(lastMessageDate)) {
                        lastMessageDate = msg.getTimestamp();
                    }
                    
                    // Détecter les topics dans le message
                    detectTopics(content, uniqueTopics);
                }
            }
        }

        // Calculer les features
        features.put("total_conversations", (double) totalConversations);
        features.put("total_messages", (double) totalMessages);
        features.put("avg_messages_per_conversation", totalConversations > 0 ? 
            (double) totalMessages / totalConversations : 0.0);
        features.put("conversation_frequency", calculateConversationFrequency(conversations));
        features.put("avg_message_length", userMessages > 0 ? 
            (double) totalMessageLength / userMessages : 0.0);
        features.put("avg_question_complexity", calculateAverageComplexity(allUserMessages));
        features.put("unique_topics_count", (double) uniqueTopics.size());

        // Calculer les métriques de quiz et exercices
        double quizAverageScore = calculateQuizAverageScore(student);
        double exerciseCompletionRate = calculateExerciseCompletionRate(student);
        double totalQuizzesTaken = (double) quizRepository.count();
        double totalExercisesCompleted = (double) exerciseRepository.count();

        features.put("quiz_average_score", quizAverageScore);
        features.put("exercise_completion_rate", exerciseCompletionRate);
        features.put("total_quizzes_taken", totalQuizzesTaken);
        features.put("total_exercises_completed", totalExercisesCompleted);

        // Calculer les métriques temporelles
        long daysActive = 0;
        double avgTimeBetweenSessions = 0.0;
        long lastActivityDaysAgo = 0;

        if (firstMessageDate != null && lastMessageDate != null) {
            daysActive = ChronoUnit.DAYS.between(firstMessageDate, lastMessageDate) + 1;
            
            if (messageDates.size() > 1) {
                Collections.sort(messageDates);
                List<Long> intervals = new ArrayList<>();
                for (int i = 1; i < messageDates.size(); i++) {
                    long interval = ChronoUnit.HOURS.between(messageDates.get(i-1), messageDates.get(i));
                    intervals.add(interval);
                }
                avgTimeBetweenSessions = intervals.isEmpty() ? 0.0 : 
                    intervals.stream().mapToLong(Long::longValue).average().orElse(0.0);
            }
            
            lastActivityDaysAgo = ChronoUnit.DAYS.between(lastMessageDate, LocalDateTime.now());
        }

        features.put("days_active", (double) daysActive);
        features.put("avg_time_between_sessions", avgTimeBetweenSessions);
        features.put("last_activity_days_ago", (double) lastActivityDaysAgo);

        // Métriques supplémentaires
        features.put("response_time_avg", 0.0); // À implémenter si nécessaire
        features.put("follow_up_questions_rate", calculateFollowUpRate(allUserMessages));
        features.put("content_consumption_rate", calculateContentConsumptionRate(student));

        return features;
    }

    /**
     * Prédit le niveau d'un étudiant en utilisant le modèle ML
     */
    public Map<String, Object> predictStudentLevel(User student) {
        try {
            // Calculer les features
            Map<String, Object> features = calculateStudentFeatures(student);

            // Appeler le modèle ML
            String url = mlModelUrl + "/student/level/predict";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(features, headers);
            
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = (ResponseEntity<Map<String, Object>>) 
                (ResponseEntity<?>) restTemplate.postForEntity(url, request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> result = new HashMap<>();
                result.put("predicted_level", response.getBody().get("predicted_level"));
                result.put("confidence", response.getBody().get("confidence"));
                result.put("probabilities", response.getBody().get("probabilities"));
                result.put("level_score", response.getBody().get("level_score"));
                result.put("features", features);
                return result;
            }
            
            // Fallback si le modèle n'est pas disponible
            return getFallbackLevel(features);
            
        } catch (Exception e) {
            System.err.println("Erreur lors de la prédiction du niveau: " + e.getMessage());
            e.printStackTrace();
            // Retourner un niveau par défaut
            Map<String, Object> features = calculateStudentFeatures(student);
            return getFallbackLevel(features);
        }
    }

    /**
     * Détecte les topics dans un message
     */
    private void detectTopics(String content, Set<String> topics) {
        String lowerContent = content.toLowerCase();
        
        // Détecter les technologies
        if (lowerContent.contains("java")) topics.add("Java");
        if (lowerContent.contains("python")) topics.add("Python");
        if (lowerContent.contains("javascript") || lowerContent.contains("js")) topics.add("JavaScript");
        if (lowerContent.contains("react") || lowerContent.contains("vue") || lowerContent.contains("angular")) topics.add("Frontend");
        if (lowerContent.contains("spring") || lowerContent.contains("hibernate")) topics.add("Java Framework");
        if (lowerContent.contains("sql") || lowerContent.contains("database")) topics.add("Database");
        if (lowerContent.contains("algorithm") || lowerContent.contains("algorithme")) topics.add("Algorithms");
        if (lowerContent.contains("oop") || lowerContent.contains("object-oriented")) topics.add("OOP");
    }

    /**
     * Calcule la fréquence de conversation
     */
    private double calculateConversationFrequency(List<Conversation> conversations) {
        if (conversations.isEmpty()) return 0.0;
        
        LocalDateTime first = conversations.stream()
            .map(Conversation::getCreatedAt)
            .min(LocalDateTime::compareTo)
            .orElse(LocalDateTime.now());
        
        LocalDateTime last = conversations.stream()
            .map(Conversation::getLastMessageDate)
            .filter(Objects::nonNull)
            .max(LocalDateTime::compareTo)
            .orElse(LocalDateTime.now());
        
        long days = ChronoUnit.DAYS.between(first, last);
        return days > 0 ? (double) conversations.size() / days : conversations.size();
    }

    /**
     * Calcule la complexité moyenne des questions
     */
    private double calculateAverageComplexity(List<String> messages) {
        if (messages.isEmpty()) return 0.0;
        
        double totalComplexity = 0.0;
        for (String msg : messages) {
            // Heuristique simple: longueur + mots techniques
            double complexity = msg.length() * 0.1;
            String[] techWords = {"class", "method", "function", "variable", "algorithm", 
                                 "complexity", "structure", "pattern", "design", "architecture"};
            for (String word : techWords) {
                if (msg.toLowerCase().contains(word)) {
                    complexity += 5.0;
                }
            }
            totalComplexity += complexity;
        }
        
        return totalComplexity / messages.size();
    }

    /**
     * Calcule le score moyen des quiz
     */
    private double calculateQuizAverageScore(User student) {
        // À implémenter avec les données réelles de quiz
        return 75.0; // Valeur par défaut
    }

    /**
     * Calcule le taux de complétion des exercices
     */
    private double calculateExerciseCompletionRate(User student) {
        // À implémenter avec les données réelles d'exercices
        return 0.6; // Valeur par défaut
    }

    /**
     * Calcule le taux de questions de suivi
     */
    private double calculateFollowUpRate(List<String> messages) {
        if (messages.size() < 2) return 0.0;
        
        int followUps = 0;
        for (int i = 1; i < messages.size(); i++) {
            String curr = messages.get(i).toLowerCase();
            
            // Détecter les mots de suivi
            if (curr.contains("pourquoi") || curr.contains("comment") || 
                curr.contains("explique") || curr.contains("détaille")) {
                followUps++;
            }
        }
        
        return (double) followUps / (messages.size() - 1);
    }

    /**
     * Calcule le taux de consommation de contenu
     */
    private double calculateContentConsumptionRate(User student) {
        List<Enrollment> enrollments = enrollmentRepository.findByUser(student);
        if (enrollments.isEmpty()) return 0.0;
        
        long completed = enrollments.stream()
            .filter(e -> {
                if (e.getProgress() != null) {
                    return e.getProgress().getOverallProgress() >= 100.0;
                }
                return false;
            })
            .count();
        
        return (double) completed / enrollments.size();
    }

    /**
     * Retourne un niveau par défaut basé sur les features
     */
    private Map<String, Object> getFallbackLevel(Map<String, Object> features) {
        double totalMessages = (double) features.getOrDefault("total_messages", 0.0);
        double avgComplexity = (double) features.getOrDefault("avg_question_complexity", 0.0);
        
        String level = "DEBUTANT";
        double confidence = 0.5;
        
        if (totalMessages > 50 && avgComplexity > 20) {
            level = "AVANCE";
            confidence = 0.7;
        } else if (totalMessages > 20 && avgComplexity > 10) {
            level = "INTERMEDIAIRE";
            confidence = 0.6;
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("predicted_level", level);
        result.put("confidence", confidence);
        result.put("probabilities", Map.of(
            "DEBUTANT", level.equals("DEBUTANT") ? 0.5 : 0.2,
            "INTERMEDIAIRE", level.equals("INTERMEDIAIRE") ? 0.5 : 0.2,
            "AVANCE", level.equals("AVANCE") ? 0.5 : 0.2,
            "EXPERT", 0.1
        ));
        result.put("level_score", level.equals("DEBUTANT") ? 25 : 
                   level.equals("INTERMEDIAIRE") ? 100 : 
                   level.equals("AVANCE") ? 225 : 300);
        result.put("features", features);
        
        return result;
    }
}

