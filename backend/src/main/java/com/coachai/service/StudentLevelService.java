package com.coachai.service;

import com.coachai.model.User;
import com.coachai.model.Conversation;
import com.coachai.model.ChatMessage;
import com.coachai.repository.ConversationRepository;
import com.coachai.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class StudentLevelService {
    
    @Autowired
    private ConversationRepository conversationRepository;
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired(required = false)
    private StudentLevelMLService studentLevelMLService;
    
    public enum StudentLevel {
        DEBUTANT(0, 50, "Débutant"),
        INTERMEDIAIRE(50, 150, "Intermédiaire"),
        AVANCE(150, 300, "Avancé"),
        EXPERT(300, Integer.MAX_VALUE, "Expert");
        
        private final int minScore;
        private final int maxScore;
        private final String label;
        
        StudentLevel(int minScore, int maxScore, String label) {
            this.minScore = minScore;
            this.maxScore = maxScore;
            this.label = label;
        }
        
        public static StudentLevel fromScore(int score) {
            if (score < DEBUTANT.maxScore) return DEBUTANT;
            if (score < INTERMEDIAIRE.maxScore) return INTERMEDIAIRE;
            if (score < AVANCE.maxScore) return AVANCE;
            return EXPERT;
        }
        
        public String getLabel() {
            return label;
        }
    }
    
    /**
     * Calcule le niveau d'un étudiant basé sur ses conversations avec le chat
     * Utilise le modèle ML (Gradient Boosting) si disponible, sinon utilise la méthode basée sur des règles
     */
    public StudentLevel calculateStudentLevel(User student) {
        // Essayer d'abord d'utiliser le modèle ML
        if (studentLevelMLService != null) {
            try {
                StudentLevel mlLevel = studentLevelMLService.predictStudentLevel(student);
                if (mlLevel != null) {
                    return mlLevel;
                }
            } catch (Exception e) {
                System.err.println("Error using ML model, falling back to rule-based method: " + e.getMessage());
            }
        }
        
        // Fallback vers la méthode basée sur des règles
        int score = calculateLevelScore(student);
        return StudentLevel.fromScore(score);
    }
    
    /**
     * Calcule le score de niveau basé sur plusieurs critères
     */
    public int calculateLevelScore(User student) {
        List<Conversation> conversations = conversationRepository.findByUserOrderByLastMessageDateDesc(student);
        
        if (conversations == null || conversations.isEmpty()) {
            return 0;
        }
        
        int score = 0;
        
        // 1. Score basé sur le nombre de conversations (max 30 points)
        int conversationCount = conversations.size();
        score += Math.min(conversationCount * 2, 30);
        
        // 2. Score basé sur le nombre total de messages (max 40 points)
        int totalMessages = 0;
        for (Conversation conv : conversations) {
            long messageCount = chatMessageRepository.countByConversation(conv);
            totalMessages += (int) messageCount;
        }
        score += Math.min(totalMessages, 40);
        
        // 3. Score basé sur la fréquence d'utilisation (max 20 points)
        // Plus l'étudiant utilise le chat régulièrement, plus il gagne de points
        if (conversations.size() > 0) {
            LocalDateTime firstConversation = conversations.get(conversations.size() - 1).getCreatedAt();
            LocalDateTime lastConversation = conversations.get(0).getLastMessageDate();
            
            if (lastConversation != null && firstConversation != null) {
                long daysBetween = ChronoUnit.DAYS.between(firstConversation, lastConversation);
                if (daysBetween > 0) {
                    double messagesPerDay = (double) totalMessages / daysBetween;
                    score += Math.min((int) (messagesPerDay * 5), 20);
                }
            }
        }
        
        // 4. Score basé sur la complexité des questions (max 10 points)
        // Analyser la longueur moyenne des messages utilisateur (indicateur de complexité)
        int userMessageCount = 0;
        int totalUserMessageLength = 0;
        for (Conversation conv : conversations) {
            List<ChatMessage> messages = chatMessageRepository.findByConversationOrderByTimestampAsc(conv);
            for (ChatMessage msg : messages) {
                if (msg.getSender() == ChatMessage.MessageSender.USER) {
                    userMessageCount++;
                    totalUserMessageLength += msg.getContent().length();
                }
            }
        }
        if (userMessageCount > 0) {
            double avgMessageLength = (double) totalUserMessageLength / userMessageCount;
            // Messages plus longs = questions plus complexes
            score += Math.min((int) (avgMessageLength / 20), 10);
        }
        
        return score;
    }
    
    /**
     * Récupère les statistiques de conversation d'un étudiant
     */
    public ConversationStats getConversationStats(User student) {
        List<Conversation> conversations = conversationRepository.findByUserOrderByLastMessageDateDesc(student);
        
        int totalConversations = conversations != null ? conversations.size() : 0;
        int totalMessages = 0;
        LocalDateTime firstConversationDate = null;
        LocalDateTime lastConversationDate = null;
        
        if (conversations != null && !conversations.isEmpty()) {
            firstConversationDate = conversations.get(conversations.size() - 1).getCreatedAt();
            lastConversationDate = conversations.get(0).getLastMessageDate();
            
            for (Conversation conv : conversations) {
                totalMessages += (int) chatMessageRepository.countByConversation(conv);
            }
        }
        
        int levelScore = calculateLevelScore(student);
        StudentLevel level = StudentLevel.fromScore(levelScore);
        
        return new ConversationStats(
            totalConversations,
            totalMessages,
            levelScore,
            level,
            firstConversationDate,
            lastConversationDate
        );
    }
    
    public static class ConversationStats {
        private final int totalConversations;
        private final int totalMessages;
        private final int levelScore;
        private final StudentLevel level;
        private final LocalDateTime firstConversationDate;
        private final LocalDateTime lastConversationDate;
        
        public ConversationStats(int totalConversations, int totalMessages, int levelScore, 
                                StudentLevel level, LocalDateTime firstConversationDate, 
                                LocalDateTime lastConversationDate) {
            this.totalConversations = totalConversations;
            this.totalMessages = totalMessages;
            this.levelScore = levelScore;
            this.level = level;
            this.firstConversationDate = firstConversationDate;
            this.lastConversationDate = lastConversationDate;
        }
        
        public int getTotalConversations() { return totalConversations; }
        public int getTotalMessages() { return totalMessages; }
        public int getLevelScore() { return levelScore; }
        public StudentLevel getLevel() { return level; }
        public LocalDateTime getFirstConversationDate() { return firstConversationDate; }
        public LocalDateTime getLastConversationDate() { return lastConversationDate; }
    }
}

