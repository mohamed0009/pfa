package com.coachai.repository;

import com.coachai.model.Quiz;
import com.coachai.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, String> {
    List<Quiz> findByCourse(Course course);
    List<Quiz> findByIsAIGeneratedTrue();
    List<Quiz> findByCourseId(String courseId);
    long countByCourse(Course course);
}


