package com.example.messengerbackend.messages.repository;

import com.example.messengerbackend.messages.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ChatRepository extends JpaRepository<Chat, UUID> {
}