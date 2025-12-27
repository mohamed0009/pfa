package com.coachai.service;

import com.coachai.model.User;
import com.coachai.model.Conversation;
import com.coachai.model.ChatMessage;
import com.coachai.model.QuizAttempt;
import com.coachai.model.ExerciseSubmission;
import com.coachai.model.CourseProgress;
import com.coachai.model.Enrollment;
import com.coachai.repository.ConversationRepository;
import com.coachai.repository.ChatMessageRepository;
import com.coachai.repository.QuizAttemptRepository;
import com.coachai.repository.ExerciseSubmissionRepository;
import com.coachai.repository.CourseProgressRepository;
import com.coachai.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.ParameterizedTypeReference;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StudentLevelMLService {
    
    @Value("${ai.model.url:http://localhost:8000}")
    private String aiModelUrl;
    
    @Autowired
    private ConversationRepository conversationRepository;
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private QuizAttemptRepository quizAttemptRepository;
    
    @Autowired
    private ExerciseSubmissionRepository exerciseSubmissionRepository;
    
    @Autowired
    private CourseProgressRepository courseProgressRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    /**
     * Calcule le niveau d'un étudiant en utilisant le modèle ML (Gradient Boosting)
     */
    public StudentLevelService.StudentLevel predictStudentLevel(User student) {
        try {
            // Extraire les features de l'étudiant
            Map<String, Object> features = extractStudentFeatures(student);
            
            // Appeler le modèle ML
            Map<String, Object> request = new HashMap<>();
            request.put("total_conversations", features.get("total_conversations"));
            request.put("total_messages", features.get("total_messages"));
            request.put("avg_messages_per_conversation", features.get("avg_messages_per_conversation"));
            request.put("conversation_frequency", features.get("conversation_frequency"));
            request.put("avg_message_length", features.get("avg_message_length"));
            request.put("avg_question_complexity", features.get("avg_question_complexity"));
            request.put("unique_topics_count", features.get("unique_topics_count"));
            request.put("quiz_average_score", features.get("quiz_average_score"));
            request.put("exercise_completion_rate", features.get("exercise_completion_rate"));
            request.put("total_quizzes_taken", features.get("total_quizzes_taken"));
            request.put("total_exercises_completed", features.get("total_exercises_completed"));
            request.put("days_active", features.get("days_active"));
            request.put("avg_time_between_sessions", features.get("avg_time_between_sessions"));
            request.put("last_activity_days_ago", features.get("last_activity_days_ago"));
            request.put("response_time_avg", features.get("response_time_avg"));
            request.put("follow_up_questions_rate", features.get("follow_up_questions_rate"));
            request.put("content_consumption_rate", features.get("content_consumption_rate"));
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ParameterizedTypeReference<Map<String, Object>> responseType = 
                new ParameterizedTypeReference<Map<String, Object>>() {};
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                aiModelUrl + "/student/level/predict",
                HttpMethod.POST,
                entity,
                responseType
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                String predictedLevel = (String) result.get("predicted_level");
                
                // Convertir le niveau prédit en enum
                return mapToStudentLevel(predictedLevel);
            }
        } catch (HttpClientErrorException e) {
            // Si le modèle ML n'est pas disponible, utiliser la méthode basée sur des règles
            System.err.println("ML model not available, falling back to rule-based method: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error calling ML model, falling back to rule-based method: " + e.getMessage());
        }
        
        // Fallback vers la méthode basée sur des règles
        return null;
    }
    
    /**
     * Extrait les features d'un étudiant pour le modèle ML
     */
    private Map<String, Object> extractStudentFeatures(User student) {
        List<Conversation> conversations = conversationRepository.findByUserOrderByLastMessageDateDesc(student);
        
        // Initialiser les valeurs par défaut
        Map<String, Object> features = new HashMap<>();
        features.put("total_conversations", 0.0);
        features.put("total_messages", 0.0);
        features.put("avg_messages_per_conversation", 0.0);
        features.put("conversation_frequency", 0.0);
        features.put("avg_message_length", 0.0);
        features.put("avg_question_complexity", 0.0);
        features.put("unique_topics_count", 0.0);
        features.put("quiz_average_score", 0.0);
        features.put("exercise_completion_rate", 0.0);
        features.put("total_quizzes_taken", 0.0);
        features.put("total_exercises_completed", 0.0);
        features.put("days_active", 0.0);
        features.put("avg_time_between_sessions", 0.0);
        features.put("last_activity_days_ago", 0.0);
        features.put("response_time_avg", 0.0);
        features.put("follow_up_questions_rate", 0.0);
        features.put("content_consumption_rate", 0.0);
        
        if (conversations == null || conversations.isEmpty()) {
            return features;
        }
        
        // 1. Métriques de conversation
        int totalConversations = conversations.size();
        int totalMessages = 0;
        int totalUserMessageLength = 0;
        int userMessageCount = 0;
        LocalDateTime firstConversation = null;
        LocalDateTime lastConversation = null;
        
        for (Conversation conv : conversations) {
            long messageCount = chatMessageRepository.countByConversation(conv);
            totalMessages += (int) messageCount;
            
            List<ChatMessage> messages = chatMessageRepository.findByConversationOrderByTimestampAsc(conv);
            for (ChatMessage msg : messages) {
                if (msg.getSender() == ChatMessage.MessageSender.USER) {
                    userMessageCount++;
                    totalUserMessageLength += msg.getContent().length();
                }
            }
            
            if (firstConversation == null || conv.getCreatedAt().isBefore(firstConversation)) {
                firstConversation = conv.getCreatedAt();
            }
            if (lastConversation == null || 
                (conv.getLastMessageDate() != null && conv.getLastMessageDate().isAfter(lastConversation))) {
                lastConversation = conv.getLastMessageDate();
            }
        }
        
        features.put("total_conversations", (double) totalConversations);
        features.put("total_messages", (double) totalMessages);
        features.put("avg_messages_per_conversation", totalConversations > 0 ? 
            (double) totalMessages / totalConversations : 0.0);
        
        // Fréquence de conversation
        if (firstConversation != null && lastConversation != null) {
            long daysBetween = ChronoUnit.DAYS.between(firstConversation, lastConversation);
            if (daysBetween > 0) {
                features.put("conversation_frequency", (double) totalConversations / daysBetween);
                features.put("days_active", (double) daysBetween);
            }
        }
        
        // Longueur moyenne des messages
        if (userMessageCount > 0) {
            features.put("avg_message_length", (double) totalUserMessageLength / userMessageCount);
            // Complexité basée sur la longueur (normalisée)
            features.put("avg_question_complexity", Math.min((double) totalUserMessageLength / userMessageCount / 50.0, 10.0));
        }
        
        // Nombre de sujets uniques (approximation basée sur les conversations)
        features.put("unique_topics_count", (double) totalConversations);
        
        // 2. Métriques de performance académique
        List<QuizAttempt> quizAttempts = quizAttemptRepository.findByUser(student);
        if (quizAttempts != null && !quizAttempts.isEmpty()) {
            double totalScore = quizAttempts.stream()
                .mapToDouble(QuizAttempt::getScore)
                .sum();
            features.put("quiz_average_score", totalScore / quizAttempts.size());
            features.put("total_quizzes_taken", (double) quizAttempts.size());
        }
        
        List<ExerciseSubmission> exerciseSubmissions = exerciseSubmissionRepository.findByUser(student);
        if (exerciseSubmissions != null && !exerciseSubmissions.isEmpty()) {
            long completed = exerciseSubmissions.stream()
                .filter(s -> s.getStatus() == ExerciseSubmission.SubmissionStatus.GRADED || 
                            s.getStatus() == ExerciseSubmission.SubmissionStatus.VALIDATED)
                .count();
            features.put("exercise_completion_rate", (double) completed / exerciseSubmissions.size());
            features.put("total_exercises_completed", (double) completed);
        }
        
        // 3. Métriques temporelles
        if (lastConversation != null) {
            long daysSinceLastActivity = ChronoUnit.DAYS.between(lastConversation, LocalDateTime.now());
            features.put("last_activity_days_ago", (double) daysSinceLastActivity);
        }
        
        // Temps moyen entre les sessions (approximation)
        if (conversations.size() > 1 && firstConversation != null && lastConversation != null) {
            long daysBetween = ChronoUnit.DAYS.between(firstConversation, lastConversation);
            if (daysBetween > 0) {
                features.put("avg_time_between_sessions", (double) daysBetween / totalConversations);
            }
        }
        
        // 4. Métriques d'engagement
        features.put("response_time_avg", 5.0); // Valeur par défaut (à améliorer)
        features.put("follow_up_questions_rate", 0.2); // Valeur par défaut (à améliorer)
        
        // Taux de consommation de contenu
        List<Enrollment> enrollments = enrollmentRepository.findByUser(student);
        if (enrollments != null && !enrollments.isEmpty()) {
            List<CourseProgress> progresses = enrollments.stream()
                .map(e -> courseProgressRepository.findByEnrollment(e).orElse(null))
                .filter(p -> p != null)
                .collect(Collectors.toList());
            
            if (!progresses.isEmpty()) {
                double avgProgress = progresses.stream()
                    .mapToDouble(CourseProgress::getOverallProgress)
                    .average()
                    .orElse(0.0);
                features.put("content_consumption_rate", avgProgress / 100.0);
            }
        }
        
        return features;
    }
    
    /**
     * Mappe le niveau prédit par le ML vers l'enum StudentLevel
     */
    private StudentLevelService.StudentLevel mapToStudentLevel(String predictedLevel) {
        if (predictedLevel == null) {
            return StudentLevelService.StudentLevel.DEBUTANT;
        }
        
        switch (predictedLevel.toUpperCase()) {
            case "DEBUTANT":
                return StudentLevelService.StudentLevel.DEBUTANT;
            case "INTERMEDIAIRE":
                return StudentLevelService.StudentLevel.INTERMEDIAIRE;
            case "AVANCE":
                return StudentLevelService.StudentLevel.AVANCE;
            case "EXPERT":
                return StudentLevelService.StudentLevel.EXPERT;
            default:
                return StudentLevelService.StudentLevel.DEBUTANT;
        }
    }
}

