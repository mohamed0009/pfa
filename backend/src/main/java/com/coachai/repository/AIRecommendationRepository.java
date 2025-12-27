package com.coachai.repository;

import com.coachai.model.AIRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIRecommendationRepository extends JpaRepository<AIRecommendation, String> {
    List<AIRecommendation> findByStatusOrderByCreatedAtDesc(AIRecommendation.RecommendationStatus status);
    List<AIRecommendation> findAllByOrderByCreatedAtDesc();
    List<AIRecommendation> findByStatusAndPriorityOrderByCreatedAtDesc(
        AIRecommendation.RecommendationStatus status, 
        AIRecommendation.Priority priority
    );
}

