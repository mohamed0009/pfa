package com.coachai.repository;

import com.coachai.model.LessonProgress;
import com.coachai.model.FormationEnrollment;
import com.coachai.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, String> {
    Optional<LessonProgress> findByEnrollmentAndLesson(FormationEnrollment enrollment, Lesson lesson);
    List<LessonProgress> findByEnrollment(FormationEnrollment enrollment);
}


