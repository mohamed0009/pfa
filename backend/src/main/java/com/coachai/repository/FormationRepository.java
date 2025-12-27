package com.coachai.repository;

import com.coachai.model.Formation;
import com.coachai.model.ContentStatus;
import com.coachai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormationRepository extends JpaRepository<Formation, String> {
    List<Formation> findByStatus(ContentStatus status);
    List<Formation> findByCategory(String category);
    List<Formation> findByLevel(Formation.Level level);
    List<Formation> findByCreatedBy(User user);
    
    // Méthodes pour filtrer par catégorie/niveau ET status
    List<Formation> findByCategoryAndStatus(String category, ContentStatus status);
    List<Formation> findByLevelAndStatus(Formation.Level level, ContentStatus status);
}

