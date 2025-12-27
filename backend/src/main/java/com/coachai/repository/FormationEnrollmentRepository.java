package com.coachai.repository;

import com.coachai.model.FormationEnrollment;
import com.coachai.model.User;
import com.coachai.model.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FormationEnrollmentRepository extends JpaRepository<FormationEnrollment, String> {
    Optional<FormationEnrollment> findByUserAndFormation(User user, Formation formation);
    List<FormationEnrollment> findByUser(User user);
    List<FormationEnrollment> findByFormation(Formation formation);
    long countByFormation(Formation formation);
    boolean existsByUserAndFormation(User user, Formation formation);
    List<FormationEnrollment> findByUserAndStatus(User user, FormationEnrollment.EnrollmentStatus status);
}


