package com.coachai.repository;

import com.coachai.model.ExerciseSubmission;
import com.coachai.model.Exercise;
import com.coachai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseSubmissionRepository extends JpaRepository<ExerciseSubmission, String> {
    List<ExerciseSubmission> findByUser(User user);
    List<ExerciseSubmission> findByExercise(Exercise exercise);
    List<ExerciseSubmission> findByUserAndExercise(User user, Exercise exercise);
    List<ExerciseSubmission> findByStatus(ExerciseSubmission.SubmissionStatus status);
}


