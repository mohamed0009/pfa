package com.coachai.repository;

import com.coachai.model.CourseProgress;
import com.coachai.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseProgressRepository extends JpaRepository<CourseProgress, String> {
    Optional<CourseProgress> findByEnrollment(Enrollment enrollment);
}


