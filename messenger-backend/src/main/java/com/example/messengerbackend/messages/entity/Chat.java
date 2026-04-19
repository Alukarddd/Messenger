package com.example.messengerbackend.messages.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chats")
@Data
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
    private String type; // "PRIVATE" или "GROUP"
    private String avatarUrl;

    @CreationTimestamp
    private LocalDateTime createdAt;
}