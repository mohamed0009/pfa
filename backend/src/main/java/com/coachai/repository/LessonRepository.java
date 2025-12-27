package com.coachai.repository;

import com.coachai.model.Lesson;
import com.coachai.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, String> {
    List<Lesson> findByCourse(Course course);
    List<Lesson> findByCourseOrderByOrderAsc(Course course);
    long countByCourse(Course course);
}

