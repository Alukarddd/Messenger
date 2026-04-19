package com.example.messengerbackend.messages.controller;

import com.example.messengerbackend.messages.dto.MessageRequest;
import com.example.messengerbackend.messages.entity.Chat;
import com.example.messengerbackend.messages.entity.Message;
import com.example.messengerbackend.messages.repository.ChatRepository;
import com.example.messengerbackend.messages.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Slf4j
@Controller // Используем обычный @Controller для работы с WebSocket (STOMP)
@RequiredArgsConstructor
public class MessageController {

    // Шаблон для рассылки сообщений через брокер
    private final SimpMessagingTemplate messagingTemplate;

    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;

    /**
     * Этот метод обрабатывает сообщения, отправленные фронтендом на префикс /app/chat/{chatId}
     */
    @MessageMapping("/chat/{chatId}")
    public void processMessage(@DestinationVariable String chatId,
                               @Payload MessageRequest request) {

        log.info("Получено сообщение через WebSocket для чата {}: {}", chatId, request.content());

        // 1. Находим чат в базе данных (ID чата у нас UUID)
        Chat chat = chatRepository.findById(UUID.fromString(chatId))
                .orElseThrow(() -> new RuntimeException("Чат не найден"));

        // 2. Создаем и сохраняем сообщение в БД (чтобы история не пропала после перезагрузки)
        Message message = new Message();
        message.setChat(chat);
        message.setSenderId(request.senderId());
        message.setContent(request.content());

        Message savedMessage = messageRepository.save(message);

        // 3. Рассылаем сохраненное сообщение всем подписчикам канала /topic/chat/{chatId}
        // Именно это сообщение фронтенд увидит в реальном времени
        messagingTemplate.convertAndSend("/topic/chat/" + chatId, savedMessage);
    }
}