package com.example.messengerbackend.messages.repository;

import com.example.messengerbackend.messages.entity.ChatParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Integer> {
    List<ChatParticipant> findAllByUserId(Integer userId);
    List<ChatParticipant> findAllByChatId(UUID chatId);

    // Этот запрос ищет общий ID чата для двух пользователей, если тип чата 'PRIVATE'
    @Query(value = """
           SELECT cp1.chat_id 
           FROM chat_participants cp1 
           JOIN chat_participants cp2 ON cp1.chat_id = cp2.chat_id 
           JOIN chats c ON cp1.chat_id = c.id 
           WHERE cp1.user_id = :user1 
             AND cp2.user_id = :user2 
             AND c.type = 'PRIVATE'
           """, nativeQuery = true)
    Optional<UUID> findPrivateChatBetweenUsers(@Param("user1") int user1, @Param("user2") int user2);
}