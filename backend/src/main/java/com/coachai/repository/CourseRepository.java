package com.coachai.repository;

import com.coachai.model.Course;
import com.coachai.model.ContentStatus;
import com.coachai.model.Module;
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
    List<Course> findByModule(Module module);
    @Query("SELECT c FROM Course c WHERE c.status = :status ORDER BY c.enrolledCount DESC")
    List<Course> findPopularCourses(ContentStatus status);
    
    // Find courses by category and status
    @Query("SELECT c FROM Course c WHERE c.category = :category AND c.status = :status")
    List<Course> findByCategoryAndStatus(String category, ContentStatus status);
    
    // Find courses by level and status
    @Query("SELECT c FROM Course c WHERE c.level = :level AND c.status = :status")
    List<Course> findByLevelAndStatus(Course.Level level, ContentStatus status);
    
    // Find courses that are PUBLISHED or belong to a PUBLISHED formation
    // This includes courses without modules (standalone courses) and courses in formations
    @Query("SELECT DISTINCT c FROM Course c " +
           "LEFT JOIN FETCH c.module m " +
           "LEFT JOIN FETCH m.formation f " +
           "WHERE c.status = :status OR (f.status = :status)")
    List<Course> findAvailableCourses(ContentStatus status);
    
    // Compter cours par module
    long countByModule(Module module);
    
    // Trouver cours par module avec ordre
    @Query("SELECT c FROM Course c WHERE c.module = :module ORDER BY c.order ASC")
    List<Course> findByModuleOrderByOrderAsc(Module module);
    
    // Compter leçons d'un cours
    @Query("SELECT COUNT(l) FROM Lesson l WHERE l.course = :course")
    long countLessonsByCourse(Course course);
}


