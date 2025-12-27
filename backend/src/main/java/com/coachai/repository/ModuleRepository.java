package com.coachai.repository;

import com.coachai.model.Module;
import com.coachai.model.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuleRepository extends JpaRepository<Module, String> {
    List<Module> findByFormation(Formation formation);
    List<Module> findByFormationOrderByOrderAsc(Formation formation);
    List<Module> findByFormationId(String formationId);
    long countByFormation(Formation formation);
}


