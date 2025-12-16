package com.coachai.repository;

import com.coachai.model.Enrollment;
import com.coachai.model.User;
import com.coachai.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, String> {
    Optional<Enrollment> findByUserAndCourse(User user, Course course);
    List<Enrollment> findByUser(User user);
    List<Enrollment> findByCourse(Course course);
    long countByCourse(Course course);
    boolean existsByUserAndCourse(User user, Course course);
}


