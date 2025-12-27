package com.coachai.repository;

import com.coachai.model.Conversation;
import com.coachai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {
    List<Conversation> findByUserOrderByLastMessageDateDesc(User user);
    List<Conversation> findByUser(User user);
    Optional<Conversation> findByUserAndIsActiveTrue(User user);
    List<Conversation> findByUserAndIsActive(User user, boolean isActive);
}

