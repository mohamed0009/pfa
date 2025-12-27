package com.coachai.controller.trainer;

import com.coachai.model.Quiz;
import com.coachai.model.QuizQuestion;
import com.coachai.model.QuizOption;
import com.coachai.repository.QuizRepository;
import com.coachai.repository.QuizQuestionRepository;
import com.coachai.repository.QuizOptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trainer/quiz-questions")
@CrossOrigin(origins = "http://localhost:4200")
public class TrainerQuizQuestionController {
    @Autowired
    private QuizQuestionRepository quizQuestionRepository;
    
    @Autowired
    private QuizOptionRepository quizOptionRepository;
    
    @Autowired
    private QuizRepository quizRepository;
    
    
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<?> getQuestionsByQuiz(
            @PathVariable String quizId,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            Quiz quiz = quizRepository.findById(quizId).orElse(null);
            if (quiz == null) {
                return ResponseEntity.notFound().build();
            }
            
            List<QuizQuestion> questions = quizQuestionRepository.findByQuizOrderByOrderAsc(quiz);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching questions", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createQuestion(
            @RequestBody Map<String, Object> questionData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (!questionData.containsKey("quizId")) {
                return ResponseEntity.badRequest().body(Map.of("error", "quizId is required"));
            }
            
            String quizId = (String) questionData.get("quizId");
            Quiz quiz = quizRepository.findById(quizId).orElse(null);
            if (quiz == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Quiz not found"));
            }
            
            QuizQuestion question = new QuizQuestion();
            question.setQuiz(quiz);
            
            if (questionData.containsKey("question")) {
                question.setQuestion((String) questionData.get("question"));
            }
            if (questionData.containsKey("type")) {
                try {
                    question.setType(QuizQuestion.QuestionType.valueOf(((String) questionData.get("type")).toUpperCase()));
                } catch (Exception e) {
                    question.setType(QuizQuestion.QuestionType.MULTIPLE_CHOICE);
                }
            } else {
                question.setType(QuizQuestion.QuestionType.MULTIPLE_CHOICE);
            }
            if (questionData.containsKey("explanation")) {
                question.setExplanation((String) questionData.get("explanation"));
            }
            if (questionData.containsKey("points")) {
                question.setPoints(((Number) questionData.get("points")).intValue());
            } else {
                question.setPoints(1);
            }
            if (questionData.containsKey("order")) {
                question.setOrder(((Number) questionData.get("order")).intValue());
            } else {
                List<QuizQuestion> existingQuestions = quizQuestionRepository.findByQuizOrderByOrderAsc(quiz);
                question.setOrder(existingQuestions.size() + 1);
            }
            question.setQuestionNumber(question.getOrder());
            
            // Gérer correctAnswer pour QCM
            if (questionData.containsKey("correctAnswer")) {
                question.setCorrectAnswer((String) questionData.get("correctAnswer"));
            }
            
            QuizQuestion saved = quizQuestionRepository.save(question);
            
            // Créer les options si présentes (pour QCM)
            if (questionData.containsKey("options") && question.getType() == QuizQuestion.QuestionType.MULTIPLE_CHOICE) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> optionsData = (List<Map<String, Object>>) questionData.get("options");
                int correctIndex = -1;
                if (questionData.containsKey("correctAnswer")) {
                    try {
                        correctIndex = Integer.parseInt((String) questionData.get("correctAnswer"));
                    } catch (Exception e) {
                        // Ignore
                    }
                }
                
                for (int i = 0; i < optionsData.size(); i++) {
                    Map<String, Object> optionData = optionsData.get(i);
                    QuizOption option = new QuizOption();
                    option.setQuestion(saved);
                    if (optionData.containsKey("text")) {
                        option.setText((String) optionData.get("text"));
                    }
                    option.setCorrect(i == correctIndex);
                    quizOptionRepository.save(option);
                }
            }
            
            // Recharger la question avec les options
            saved = quizQuestionRepository.findById(saved.getId()).orElse(saved);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error creating question", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuestion(
            @PathVariable String id,
            @RequestBody Map<String, Object> updateData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            return quizQuestionRepository.findById(id)
                .map(question -> {
                    if (updateData.containsKey("question")) {
                        question.setQuestion((String) updateData.get("question"));
                    }
                    if (updateData.containsKey("type")) {
                        try {
                            question.setType(QuizQuestion.QuestionType.valueOf(((String) updateData.get("type")).toUpperCase()));
                        } catch (Exception e) {
                            // Invalid type, skip
                        }
                    }
                    if (updateData.containsKey("explanation")) {
                        question.setExplanation((String) updateData.get("explanation"));
                    }
                    if (updateData.containsKey("points")) {
                        question.setPoints(((Number) updateData.get("points")).intValue());
                    }
                    if (updateData.containsKey("order")) {
                        question.setOrder(((Number) updateData.get("order")).intValue());
                        question.setQuestionNumber(question.getOrder());
                    }
                    if (updateData.containsKey("correctAnswer")) {
                        question.setCorrectAnswer((String) updateData.get("correctAnswer"));
                    }
                    
                    QuizQuestion saved = quizQuestionRepository.save(question);
                    
                    // Mettre à jour les options si présentes
                    if (updateData.containsKey("options") && question.getType() == QuizQuestion.QuestionType.MULTIPLE_CHOICE) {
                        // Supprimer les anciennes options
                        quizOptionRepository.deleteAll(question.getOptions());
                        
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> optionsData = (List<Map<String, Object>>) updateData.get("options");
                        int correctIndex = -1;
                        if (updateData.containsKey("correctAnswer")) {
                            try {
                                correctIndex = Integer.parseInt((String) updateData.get("correctAnswer"));
                            } catch (Exception e) {
                                // Ignore
                            }
                        }
                        
                        for (int i = 0; i < optionsData.size(); i++) {
                            Map<String, Object> optionData = optionsData.get(i);
                            QuizOption option = new QuizOption();
                            option.setQuestion(saved);
                            if (optionData.containsKey("text")) {
                                option.setText((String) optionData.get("text"));
                            }
                            option.setCorrect(i == correctIndex);
                            quizOptionRepository.save(option);
                        }
                    }
                    
                    // Recharger avec les options
                    saved = quizQuestionRepository.findById(saved.getId()).orElse(saved);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error updating question", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (!quizQuestionRepository.existsById(id)) {
                return ResponseEntity.status(404).body(Map.of("error", "Question not found"));
            }
            
            quizQuestionRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error deleting question", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

