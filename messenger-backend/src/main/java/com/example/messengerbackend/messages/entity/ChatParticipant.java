package com.example.messengerbackend.messages.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "chat_participants")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ChatParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "chat_id")
    private UUID chatId; // Ссылка на ID чата (UUID)

    @Column(name = "user_id")
    private Integer userId; // Ссылка на ID пользователя (int)
}