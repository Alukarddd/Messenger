package com.example.messengerbackend.messages.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "attachments")
@Data
public class Attachment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "chat_id")
    private Chat chat;

    private String url;
    private String type; // "IMAGE", "FILE", "LINK"
    private String fileName;

    @CreationTimestamp
    private LocalDateTime createdAt;
}