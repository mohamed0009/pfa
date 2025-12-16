package com.coachai.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "chat_attachments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private ChatMessage message;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttachmentType type;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private String url;
    
    public enum AttachmentType {
        LINK, DOCUMENT, EXERCISE, AUDIO
    }
}


