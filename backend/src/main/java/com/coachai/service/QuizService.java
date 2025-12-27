package com.coachai.service;

import com.coachai.model.*;
import com.coachai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service de gestion des quiz avec règles de tentatives
 * Règles:
 * - Nombre de tentatives limité (ex: 3)
 * - Meilleur score conservé
 * - Quiz non validé bloque l'accès au module suivant
 */
@Service
public class QuizService {
    
    @Autowired
    private QuizRepository quizRepository;
    
    @Autowired
    private QuizAttemptRepository attemptRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private QuizAnswerRepository quizAnswerRepository;
    
    /**
     * Vérifie si un utilisateur peut tenter un quiz
     * Règle: Nombre de tentatives limité (max 3 par défaut)
     */
    public boolean canAttemptQuiz(String userId, String quizId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));
        
        long attemptCount = attemptRepository.countByUserAndQuiz(user, quiz);
        return attemptCount < quiz.getMaxAttempts();
    }
    
    /**
     * Soumet une tentative de quiz
     * Règle: Meilleur score conservé
     */
    @Transactional
    public QuizAttempt submitQuizAttempt(String userId, String quizId, List<QuizAnswer> answers) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));
        
        // Vérifier le nombre de tentatives
        long attemptCount = attemptRepository.countByUserAndQuiz(user, quiz);
        if (attemptCount >= quiz.getMaxAttempts()) {
            throw new IllegalStateException("Nombre maximum de tentatives atteint (" + quiz.getMaxAttempts() + ")");
        }
        
        // Calculer le score
        double score = calculateScore(quiz, answers);
        boolean passed = score >= quiz.getPassingScore();
        
        // Créer la tentative
        QuizAttempt attempt = new QuizAttempt();
        attempt.setUser(user);
        attempt.setQuiz(quiz);
        attempt.setAttemptNumber((int) attemptCount + 1);
        attempt.setScore(score);
        attempt.setPassed(passed);
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setSubmittedAt(LocalDateTime.now());
        
        // Sauvegarder les réponses
        for (QuizAnswer answer : answers) {
            answer.setAttempt(attempt);
            quizAnswerRepository.save(answer);
        }
        
        attempt.setAnswers(answers);
        
        QuizAttempt saved = attemptRepository.save(attempt);
        
        return saved;
    }
    
    /**
     * Récupère le meilleur score d'un utilisateur pour un quiz
     */
    public Optional<QuizAttempt> getBestAttempt(String userId, String quizId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));
        
        return attemptRepository.findFirstByUserAndQuizOrderByScoreDesc(user, quiz);
    }
    
    /**
     * Calcule le score d'un quiz
     */
    private double calculateScore(Quiz quiz, List<QuizAnswer> answers) {
        List<QuizQuestion> questions = quiz.getQuestions();
        if (questions == null || questions.isEmpty()) {
            return 0.0;
        }
        
        int correctAnswers = 0;
        
        for (QuizQuestion question : questions) {
            QuizAnswer userAnswer = answers.stream()
                .filter(a -> a.getQuestion().getId().equals(question.getId()))
                .findFirst()
                .orElse(null);
            
            if (userAnswer != null && isAnswerCorrect(question, userAnswer)) {
                correctAnswers++;
            }
        }
        
        return (double) correctAnswers / questions.size() * 100.0;
    }
    
    /**
     * Vérifie si une réponse est correcte
     */
    private boolean isAnswerCorrect(QuizQuestion question, QuizAnswer answer) {
        // Pour QCM, vérifier si la réponse correspond à la bonne réponse
        if (question.getType() == QuizQuestion.QuestionType.MULTIPLE_CHOICE) {
            if (question.getCorrectAnswer() == null || answer.getUserAnswer() == null) {
                return false;
            }
            return question.getCorrectAnswer().equalsIgnoreCase(answer.getUserAnswer().trim());
        }
        
        // Pour vrai/faux
        if (question.getType() == QuizQuestion.QuestionType.TRUE_FALSE) {
            if (question.getCorrectAnswer() == null || answer.getUserAnswer() == null) {
                return false;
            }
            return question.getCorrectAnswer().equalsIgnoreCase(answer.getUserAnswer().trim());
        }
        
        // Pour les autres types, comparer directement
        if (question.getCorrectAnswer() == null || answer.getUserAnswer() == null) {
            return false;
        }
        return question.getCorrectAnswer().equalsIgnoreCase(answer.getUserAnswer().trim());
    }
}

