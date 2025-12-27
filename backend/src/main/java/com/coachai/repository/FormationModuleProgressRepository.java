package com.coachai.repository;

import com.coachai.model.FormationModuleProgress;
import com.coachai.model.FormationProgress;
import com.coachai.model.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FormationModuleProgressRepository extends JpaRepository<FormationModuleProgress, String> {
    Optional<FormationModuleProgress> findByFormationProgressAndModule(FormationProgress progress, Module module);
    List<FormationModuleProgress> findByFormationProgress(FormationProgress progress);
}

