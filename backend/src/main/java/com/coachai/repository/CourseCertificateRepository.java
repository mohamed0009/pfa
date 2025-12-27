package com.coachai.repository;

import com.coachai.model.Course;
import com.coachai.model.CourseCertificate;
import com.coachai.model.Enrollment;
import com.coachai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseCertificateRepository extends JpaRepository<CourseCertificate, String> {

    Optional<CourseCertificate> findByEnrollment(Enrollment enrollment);

    List<CourseCertificate> findByUser(User user);

    List<CourseCertificate> findByCourse(Course course);

    Optional<CourseCertificate> findByVerificationCode(String verificationCode);
}


