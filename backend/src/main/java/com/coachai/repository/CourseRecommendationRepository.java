package com.coachai.repository;

import com.coachai.model.CourseRecommendation;
import com.coachai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRecommendationRepository extends JpaRepository<CourseRecommendation, String> {
    List<CourseRecommendation> findByStudentOrderByCreatedAtDesc(User student);
    List<CourseRecommendation> findByStatus(CourseRecommendation.RecommendationStatus status);
    List<CourseRecommendation> findByStudentAndStatus(User student, CourseRecommendation.RecommendationStatus status);
    boolean existsByStudentAndCourseAndStatus(User student, com.coachai.model.Course course, CourseRecommendation.RecommendationStatus status);
}

