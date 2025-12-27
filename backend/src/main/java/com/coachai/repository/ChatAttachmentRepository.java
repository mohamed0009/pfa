package com.coachai.repository;

import com.coachai.model.ChatAttachment;
import com.coachai.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatAttachmentRepository extends JpaRepository<ChatAttachment, String> {
    List<ChatAttachment> findByMessage(ChatMessage message);
    List<ChatAttachment> findByMessageId(String messageId);
}

