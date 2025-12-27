package com.coachai.repository;

import com.coachai.model.FormationProgress;
import com.coachai.model.FormationEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FormationProgressRepository extends JpaRepository<FormationProgress, String> {
    Optional<FormationProgress> findByEnrollment(FormationEnrollment enrollment);
}


