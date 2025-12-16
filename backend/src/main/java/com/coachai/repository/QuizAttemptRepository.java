package com.coachai.repository;

import com.coachai.model.QuizAttempt;
import com.coachai.model.Quiz;
import com.coachai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, String> {
    List<QuizAttempt> findByUser(User user);
    List<QuizAttempt> findByQuiz(Quiz quiz);
    List<QuizAttempt> findByUserAndQuiz(User user, Quiz quiz);
    Optional<QuizAttempt> findFirstByUserAndQuizOrderByScoreDesc(User user, Quiz quiz);
    long countByUserAndQuiz(User user, Quiz quiz);
}


