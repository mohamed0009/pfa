package com.coachai.service;

import com.coachai.model.*;
import com.coachai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CourseRecommendationService {
    
    private static final String ML_MODEL_URL = "http://localhost:8000/coach/predict";
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Autowired
    private ConversationRepository conversationRepository;
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private CourseRecommendationRepository recommendationRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    /**
     * Génère des recommandations de cours pour un étudiant basé sur ses conversations
     */
    public List<CourseRecommendation> generateRecommendations(User student) {
        List<Conversation> conversations = conversationRepository.findByUserOrderByLastMessageDateDesc(student);
        
        if (conversations == null || conversations.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Extraire les mots-clés et sujets des conversations
        Map<String, Integer> topicFrequency = extractTopicsFromConversations(conversations);
        
        // Récupérer tous les cours disponibles
        List<Course> allCourses = courseRepository.findAll();
        
        // Récupérer les cours déjà suivis par l'étudiant
        List<Enrollment> enrollments = enrollmentRepository.findByUser(student);
        Set<String> enrolledCourseIds = enrollments.stream()
            .map(e -> e.getCourse().getId())
            .collect(Collectors.toSet());
        
        // Filtrer les cours déjà suivis
        List<Course> availableCourses = allCourses.stream()
            .filter(course -> !enrolledCourseIds.contains(course.getId()))
            .filter(course -> course.getStatus() == ContentStatus.PUBLISHED)
            .collect(Collectors.toList());
        
        System.out.println("=== GENERATION DE RECOMMANDATIONS ===");
        System.out.println("Étudiant: " + student.getEmail());
        System.out.println("Conversations trouvées: " + conversations.size());
        System.out.println("Cours disponibles: " + availableCourses.size());
        System.out.println("Topics extraits: " + topicFrequency.size());
        topicFrequency.forEach((topic, freq) -> System.out.println("  - " + topic + ": " + freq));
        
        // Calculer le score de pertinence pour chaque cours
        List<CourseRecommendation> recommendations = new ArrayList<>();
        
        for (Course course : availableCourses) {
            double relevanceScore = calculateRelevanceScore(course, topicFrequency, conversations);
            System.out.println("Cours: " + course.getTitle() + " - Score: " + relevanceScore);
            
            if (relevanceScore > 10) { // Seuil minimum de pertinence réduit pour tester
                // Vérifier si une recommandation similaire existe déjà
                if (!recommendationRepository.existsByStudentAndCourseAndStatus(
                    student, course, CourseRecommendation.RecommendationStatus.PENDING)) {
                    
                    CourseRecommendation recommendation = new CourseRecommendation();
                    recommendation.setStudent(student);
                    recommendation.setCourse(course);
                    recommendation.setConfidenceScore(relevanceScore);
                    recommendation.setReason(generateRecommendationReason(course, topicFrequency, conversations));
                    recommendation.setConversationExcerpt(extractRelevantConversationExcerpt(course, conversations));
                    recommendation.setStatus(CourseRecommendation.RecommendationStatus.PENDING);
                    
                    recommendations.add(recommendation);
                    System.out.println("  -> Recommandation créée pour: " + course.getTitle());
                } else {
                    System.out.println("  -> Recommandation déjà existante pour: " + course.getTitle());
                }
            }
        }
        
        System.out.println("Recommandations candidates: " + recommendations.size());
        
        // Trier par score de confiance décroissant
        recommendations.sort((a, b) -> Double.compare(b.getConfidenceScore(), a.getConfidenceScore()));
        
        // Limiter à 5 recommandations maximum
        List<CourseRecommendation> topRecommendations = recommendations.stream()
            .limit(5)
            .collect(Collectors.toList());
        
        System.out.println("Recommandations finales à sauvegarder: " + topRecommendations.size());
        
        // Sauvegarder les recommandations
        return recommendationRepository.saveAll(topRecommendations);
    }
    
    /**
     * Extrait les sujets et mots-clés des conversations en utilisant le modèle ML
     */
    private Map<String, Integer> extractTopicsFromConversations(List<Conversation> conversations) {
        Map<String, Integer> topicFrequency = new HashMap<>();
        Map<String, Double> difficultyScores = new HashMap<>(); // Pour stocker les scores de difficulté du ML
        
        // Mots-clés techniques communs
        String[] technicalKeywords = {
            "javascript", "java", "python", "react", "angular", "vue", "node", "sql", "database",
            "api", "rest", "graphql", "html", "css", "typescript", "docker", "kubernetes",
            "algorithm", "data structure", "machine learning", "ai", "frontend", "backend",
            "mobile", "android", "ios", "web", "design", "ui", "ux", "testing", "debugging"
        };
        
        // Analyser chaque message avec le modèle ML
        for (Conversation conv : conversations) {
            List<ChatMessage> messages = chatMessageRepository.findByConversationOrderByTimestampAsc(conv);
            for (ChatMessage msg : messages) {
                if (msg.getSender() == ChatMessage.MessageSender.USER) {
                    String content = msg.getContent().toLowerCase();
                    
                    // Appeler le modèle ML pour analyser la difficulté et les sujets
                    try {
                        Map<String, Object> mlAnalysis = analyzeWithMLModel(msg.getContent());
                        if (mlAnalysis != null) {
                            String predictedDifficulty = (String) mlAnalysis.get("predicted_difficulty");
                            Double confidence = (Double) mlAnalysis.get("confidence");
                            
                            // Extraire les sujets basés sur la prédiction du ML
                            if (predictedDifficulty != null) {
                                difficultyScores.put(predictedDifficulty, 
                                    difficultyScores.getOrDefault(predictedDifficulty, 0.0) + 
                                    (confidence != null ? confidence : 0.5));
                            }
                        }
                    } catch (Exception e) {
                        // Si le ML échoue, continuer avec l'analyse basique
                        System.err.println("Erreur lors de l'analyse ML: " + e.getMessage());
                    }
                    
                    // Compter les occurrences de mots-clés techniques
                    for (String keyword : technicalKeywords) {
                        if (content.contains(keyword)) {
                            topicFrequency.put(keyword, topicFrequency.getOrDefault(keyword, 0) + 1);
                        }
                    }
                    
                    // Extraire d'autres mots significatifs (longueur > 4)
                    String[] words = content.split("\\s+");
                    for (String word : words) {
                        word = word.replaceAll("[^a-zA-Z]", "").toLowerCase();
                        if (word.length() > 4) {
                            topicFrequency.put(word, topicFrequency.getOrDefault(word, 0) + 1);
                        }
                    }
                }
            }
        }
        
        // Ajouter les scores de difficulté du ML aux fréquences de topics
        for (Map.Entry<String, Double> entry : difficultyScores.entrySet()) {
            topicFrequency.put("ml_difficulty_" + entry.getKey().toLowerCase(), 
                entry.getValue().intValue());
        }
        
        return topicFrequency;
    }
    
    /**
     * Analyse un message avec le modèle ML pour prédire la difficulté et extraire les sujets
     */
    private Map<String, Object> analyzeWithMLModel(String question) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("question", question);
            requestBody.put("difficulty_hint", "unknown");
            requestBody.put("subject", "unknown");
            requestBody.put("topic", "unknown");
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ParameterizedTypeReference<Map<String, Object>> responseType = 
                new ParameterizedTypeReference<Map<String, Object>>() {};
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                ML_MODEL_URL,
                HttpMethod.POST,
                request,
                responseType
            );
            
            if (response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de l'appel au modèle ML: " + e.getMessage());
        }
        return null;
    }
    
    /**
     * Calcule le score de pertinence d'un cours par rapport aux conversations
     */
    private double calculateRelevanceScore(Course course, Map<String, Integer> topicFrequency, 
                                         List<Conversation> conversations) {
        double score = 0.0;
        
        // 1. Correspondance avec le titre et la description du cours (40 points max)
        String courseText = (course.getTitle() + " " + 
                           (course.getDescription() != null ? course.getDescription() : "") + " " +
                           (course.getCategory() != null ? course.getCategory() : "")).toLowerCase();
        
        for (Map.Entry<String, Integer> entry : topicFrequency.entrySet()) {
            if (courseText.contains(entry.getKey())) {
                score += entry.getValue() * 5; // Plus le mot est fréquent, plus il compte
            }
        }
        score = Math.min(score, 40);
        
        // 2. Correspondance avec les compétences du cours (30 points max)
        if (course.getSkills() != null) {
            for (String skill : course.getSkills()) {
                String skillLower = skill.toLowerCase();
                for (String topic : topicFrequency.keySet()) {
                    if (skillLower.contains(topic) || topic.contains(skillLower)) {
                        score += topicFrequency.get(topic) * 3;
                    }
                }
            }
        }
        score = Math.min(score, 70);
        
        // 3. Correspondance avec les objectifs d'apprentissage (20 points max)
        if (course.getLearningObjectives() != null) {
            for (String objective : course.getLearningObjectives()) {
                String objLower = objective.toLowerCase();
                for (String topic : topicFrequency.keySet()) {
                    if (objLower.contains(topic)) {
                        score += topicFrequency.get(topic) * 2;
                    }
                }
            }
        }
        score = Math.min(score, 90);
        
        // 4. Bonus pour la récence des conversations (10 points max)
        if (!conversations.isEmpty()) {
            long daysSinceLastConversation = java.time.temporal.ChronoUnit.DAYS.between(
                conversations.get(0).getLastMessageDate(), 
                java.time.LocalDateTime.now()
            );
            if (daysSinceLastConversation < 7) {
                score += 10;
            } else if (daysSinceLastConversation < 30) {
                score += 5;
            }
        }
        
        return Math.min(score, 100);
    }
    
    /**
     * Génère une raison de recommandation
     */
    private String generateRecommendationReason(Course course, Map<String, Integer> topicFrequency, 
                                                List<Conversation> conversations) {
        StringBuilder reason = new StringBuilder();
        reason.append("Recommandé basé sur les conversations de l'apprenant. ");
        
        // Trouver les sujets les plus pertinents
        List<String> relevantTopics = new ArrayList<>();
        String courseText = (course.getTitle() + " " + 
                           (course.getDescription() != null ? course.getDescription() : "")).toLowerCase();
        
        for (Map.Entry<String, Integer> entry : topicFrequency.entrySet()) {
            if (courseText.contains(entry.getKey()) && entry.getValue() > 0) {
                relevantTopics.add(entry.getKey());
            }
        }
        
        if (!relevantTopics.isEmpty()) {
            reason.append("L'apprenant a mentionné: ");
            reason.append(String.join(", ", relevantTopics.stream().limit(3).collect(Collectors.toList())));
            reason.append(". ");
        }
        
        reason.append("Ce cours couvre ces sujets et correspond à ses intérêts exprimés dans le chat.");
        
        return reason.toString();
    }
    
    /**
     * Extrait un extrait de conversation pertinent
     */
    private String extractRelevantConversationExcerpt(Course course, List<Conversation> conversations) {
        String courseText = (course.getTitle() + " " + 
                           (course.getDescription() != null ? course.getDescription() : "")).toLowerCase();
        
        for (Conversation conv : conversations) {
            List<ChatMessage> messages = chatMessageRepository.findByConversationOrderByTimestampAsc(conv);
            for (ChatMessage msg : messages) {
                if (msg.getSender() == ChatMessage.MessageSender.USER) {
                    String content = msg.getContent().toLowerCase();
                    // Vérifier si le message contient des mots-clés du cours
                    String[] courseWords = courseText.split("\\s+");
                    for (String word : courseWords) {
                        if (word.length() > 4 && content.contains(word)) {
                            // Retourner un extrait du message (max 200 caractères)
                            String excerpt = msg.getContent();
                            if (excerpt.length() > 200) {
                                excerpt = excerpt.substring(0, 197) + "...";
                            }
                            return excerpt;
                        }
                    }
                }
            }
        }
        
        // Si aucun extrait pertinent n'est trouvé, retourner le dernier message
        if (!conversations.isEmpty()) {
            List<ChatMessage> messages = chatMessageRepository.findByConversationOrderByTimestampAsc(
                conversations.get(0));
            if (!messages.isEmpty()) {
                ChatMessage lastUserMessage = messages.stream()
                    .filter(m -> m.getSender() == ChatMessage.MessageSender.USER)
                    .reduce((first, second) -> second)
                    .orElse(null);
                
                if (lastUserMessage != null) {
                    String excerpt = lastUserMessage.getContent();
                    if (excerpt.length() > 200) {
                        excerpt = excerpt.substring(0, 197) + "...";
                    }
                    return excerpt;
                }
            }
        }
        
        return "Aucun extrait disponible";
    }
}

