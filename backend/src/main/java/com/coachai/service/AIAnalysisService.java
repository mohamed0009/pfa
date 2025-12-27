package com.coachai.service;

import com.coachai.model.*;
import com.coachai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIAnalysisService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private ExerciseSubmissionRepository exerciseSubmissionRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String ML_SERVICE_URL = "http://localhost:8000";

    /**
     * Prédit le niveau d'un étudiant en utilisant le modèle ML Python
     */
    public Map<String, Object> predictStudentLevel(User student) {
        try {
            // Collecter les données de l'étudiant
            Map<String, Object> studentData = collectStudentData(student);
            
            // Appeler le service ML Python
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(studentData, headers);
            
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(
                ML_SERVICE_URL + "/student/level/predict",
                request,
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            }
            
            return createFallbackLevelPrediction();
        } catch (Exception e) {
            e.printStackTrace();
            return createFallbackLevelPrediction();
        }
    }

    /**
     * Collecte les données d'un étudiant pour la prédiction
     */
    private Map<String, Object> collectStudentData(User student) {
        Map<String, Object> data = new HashMap<>();
        
        // Données de conversation
        List<Conversation> conversations = conversationRepository.findByUser(student);
        data.put("total_conversations", (double) conversations.size());
        
        long totalMessages = 0;
        for (Conversation conv : conversations) {
            totalMessages += conv.getMessagesCount();
        }
        data.put("total_messages", (double) totalMessages);
        
        double avgMessagesPerConv = conversations.isEmpty() ? 0.0 : 
            (double) totalMessages / conversations.size();
        data.put("avg_messages_per_conversation", avgMessagesPerConv);
        
        // Fréquence des conversations (conversations par jour)
        long daysSinceJoined = ChronoUnit.DAYS.between(student.getJoinedAt(), LocalDateTime.now());
        double conversationFrequency = daysSinceJoined > 0 ? 
            (double) conversations.size() / daysSinceJoined : 0.0;
        data.put("conversation_frequency", conversationFrequency);
        
        // Longueur moyenne des messages (approximation)
        double avgMessageLength = avgMessagesPerConv > 0 ? 80.0 : 0.0; // Approximation
        data.put("avg_message_length", avgMessageLength);
        
        // Complexité moyenne des questions (basée sur longueur et mots)
        double avgQuestionComplexity = avgMessageLength / 50.0; // Normalisé
        data.put("avg_question_complexity", Math.min(avgQuestionComplexity, 10.0));
        
        // Sujets uniques (estimation basée sur conversations)
        long uniqueTopics = conversations.size() * 2; // Approximation
        data.put("unique_topics_count", (double) uniqueTopics);
        
        // Données de quiz
        List<QuizAttempt> quizAttempts = quizAttemptRepository.findByUser(student);
        double quizAvgScore = quizAttempts.stream()
            .mapToDouble(QuizAttempt::getScore)
            .average()
            .orElse(0.0);
        data.put("quiz_average_score", quizAvgScore);
        data.put("total_quizzes_taken", (double) quizAttempts.size());
        
        // Données d'exercices
        List<ExerciseSubmission> submissions = exerciseSubmissionRepository.findByUser(student);
        long completedExercises = submissions.stream()
            .filter(s -> s.getStatus() == ExerciseSubmission.SubmissionStatus.GRADED || 
                         s.getStatus() == ExerciseSubmission.SubmissionStatus.VALIDATED)
            .count();
        double exerciseCompletionRate = submissions.isEmpty() ? 0.0 : 
            (double) completedExercises / submissions.size();
        data.put("exercise_completion_rate", exerciseCompletionRate);
        data.put("total_exercises_completed", (double) completedExercises);
        
        // Jours actifs (approximation)
        data.put("days_active", (double) Math.min(daysSinceJoined, 90));
        
        // Temps moyen entre sessions (en heures)
        data.put("avg_time_between_sessions", 24.0); // Approximation
        
        // Dernière activité
        LocalDateTime lastActivity = student.getLastActive() != null ? 
            student.getLastActive() : student.getJoinedAt();
        long daysSinceLastActivity = ChronoUnit.DAYS.between(lastActivity, LocalDateTime.now());
        data.put("last_activity_days_ago", (double) daysSinceLastActivity);
        
        // Temps de réponse moyen (approximation)
        data.put("response_time_avg", 120.0); // Secondes
        
        // Taux de questions de suivi
        data.put("follow_up_questions_rate", 0.4); // 40% des questions sont des suivis
        
        // Taux de consommation de contenu
        data.put("content_consumption_rate", quizAvgScore / 100.0);
        
        return data;
    }

    /**
     * Analyse les conversations pour détecter les difficultés
     */
    public List<Map<String, Object>> analyzeConversationDifficulties(User student) {
        List<Map<String, Object>> difficulties = new ArrayList<>();
        
        List<Conversation> conversations = conversationRepository.findByUser(student);
        Map<String, Integer> topicFrequency = new HashMap<>();
        
        // Compter les mentions de sujets courants
        for (Conversation conv : conversations) {
            // Analyser le contenu du dernier message
            String lastMessage = conv.getLastMessage();
            if (lastMessage != null) {
                String content = lastMessage.toLowerCase();
                    
                // Détection de topics CSS
                if (content.contains("centrer") || content.contains("center")) {
                    topicFrequency.merge("Centrer un div CSS", 1, Integer::sum);
                }
                if (content.contains("flexbox")) {
                    topicFrequency.merge("Flexbox CSS", 1, Integer::sum);
                }
                if (content.contains("grid")) {
                    topicFrequency.merge("Grid CSS", 1, Integer::sum);
                }
                
                // Détection de topics Python
                if (content.contains("boucle") || content.contains("loop")) {
                    topicFrequency.merge("Boucles Python", 1, Integer::sum);
                }
                if (content.contains("fonction") || content.contains("function")) {
                    topicFrequency.merge("Fonctions Python", 1, Integer::sum);
                }
            }
        }
        
        // Convertir en liste de difficultés
        for (Map.Entry<String, Integer> entry : topicFrequency.entrySet()) {
            if (entry.getValue() >= 2) { // Minimum 2 mentions
                Map<String, Object> difficulty = new HashMap<>();
                difficulty.put("topic", entry.getKey());
                difficulty.put("frequency", entry.getValue());
                difficulty.put("severity", entry.getValue() >= 3 ? "HIGH" : "MEDIUM");
                difficulty.put("lastMentioned", LocalDateTime.now());
                difficulties.add(difficulty);
            }
        }
        
        return difficulties;
    }

    /**
     * Génère des recommandations basées sur l'analyse IA
     */
    public List<Map<String, Object>> generateRecommendations(User student) {
        List<Map<String, Object>> recommendations = new ArrayList<>();
        
        // Prédire le niveau
        Map<String, Object> levelPrediction = predictStudentLevel(student);
        String predictedLevel = (String) levelPrediction.get("predicted_level");
        
        // Analyser les difficultés
        List<Map<String, Object>> difficulties = analyzeConversationDifficulties(student);
        
        // Générer recommandations basées sur les difficultés
        for (Map<String, Object> diff : difficulties) {
            String topic = (String) diff.get("topic");
            int frequency = (int) diff.get("frequency");
            String severity = (String) diff.get("severity");
            
            Map<String, Object> reco = new HashMap<>();
            reco.put("id", UUID.randomUUID().toString());
            reco.put("type", "MODULE");
            reco.put("title", "Module de renforcement: " + topic);
            reco.put("justification", 
                String.format("L'étudiant a mentionné ce sujet %d fois dans ses conversations", frequency));
            reco.put("basedOn", Arrays.asList(
                "Niveau détecté: " + predictedLevel,
                "Difficulté: " + severity,
                "Fréquence: " + frequency + " mentions"
            ));
            reco.put("priority", "HIGH".equals(severity) ? "HIGH" : "MEDIUM");
            reco.put("status", "PENDING");
            reco.put("createdAt", LocalDateTime.now());
            
            recommendations.add(reco);
        }
        
        return recommendations;
    }

    private Map<String, Object> createFallbackLevelPrediction() {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("predicted_level", "DEBUTANT");
        fallback.put("confidence", 0.7);
        fallback.put("level_score", 50.0);
        
        Map<String, Double> probabilities = new HashMap<>();
        probabilities.put("DEBUTANT", 0.7);
        probabilities.put("INTERMEDIAIRE", 0.2);
        probabilities.put("AVANCE", 0.08);
        probabilities.put("EXPERT", 0.02);
        fallback.put("probabilities", probabilities);
        
        return fallback;
    }
}

