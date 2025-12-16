package com.coachai.repository;

import com.coachai.model.Course;
import com.coachai.model.ContentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {
    List<Course> findByStatus(ContentStatus status);
    List<Course> findByCategory(String category);
    List<Course> findByLevel(Course.Level level);
    List<Course> findByIsPopularTrue();
    @Query("SELECT c FROM Course c WHERE c.status = :status ORDER BY c.enrolledCount DESC")
    List<Course> findPopularCourses(ContentStatus status);
}


