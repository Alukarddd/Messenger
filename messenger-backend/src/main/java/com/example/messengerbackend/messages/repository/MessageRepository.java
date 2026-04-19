package com.example.messengerbackend.messages.repository;

import com.example.messengerbackend.messages.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    // Метод для получения всех сообщений конкретного чата
    List<Message> findAllByChatIdOrderByCreatedAtAsc(UUID chatId);
}