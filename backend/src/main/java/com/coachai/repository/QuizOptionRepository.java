package com.coachai.repository;

import com.coachai.model.QuizOption;
import com.coachai.model.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizOptionRepository extends JpaRepository<QuizOption, String> {
    List<QuizOption> findByQuestion(QuizQuestion question);
}

