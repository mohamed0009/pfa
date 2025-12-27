package com.coachai.repository;

import com.coachai.model.ModuleProgress;
import com.coachai.model.FormationEnrollment;
import com.coachai.model.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleProgressRepository extends JpaRepository<ModuleProgress, String> {
    Optional<ModuleProgress> findByEnrollmentAndModule(FormationEnrollment enrollment, Module module);
    List<ModuleProgress> findByEnrollment(FormationEnrollment enrollment);
    List<ModuleProgress> findByEnrollmentOrderByModuleOrderAsc(FormationEnrollment enrollment);
    long countByEnrollment(FormationEnrollment enrollment);
    long countByEnrollmentAndIsModuleValidated(FormationEnrollment enrollment, boolean validated);
}

