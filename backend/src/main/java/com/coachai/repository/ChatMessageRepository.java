package com.coachai.repository;

import com.coachai.model.ChatMessage;
import com.coachai.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    List<ChatMessage> findByConversationOrderByTimestampAsc(Conversation conversation);
    long countByConversation(Conversation conversation);
}


