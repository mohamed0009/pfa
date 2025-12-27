package com.coachai.repository;

import com.coachai.model.Exercise;
import com.coachai.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, String> {
    List<Exercise> findByCourse(Course course);
    List<Exercise> findByCourseId(String courseId);
    List<Exercise> findByIsAIGeneratedTrue();
}


