package com.coachai.repository;

import com.coachai.model.QuizQuestion;
import com.coachai.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, String> {
    List<QuizQuestion> findByQuiz(Quiz quiz);
    List<QuizQuestion> findByQuizOrderByOrderAsc(Quiz quiz);
}

