package com.example.messengerbackend.messages.controller;

import com.example.messengerbackend.FileStorage.facade.FilesMetaDataFacade;
import com.example.messengerbackend.messages.dto.MessageRequest;
import com.example.messengerbackend.messages.entity.Attachment;
import com.example.messengerbackend.messages.entity.Chat;
import com.example.messengerbackend.messages.entity.Message;
import com.example.messengerbackend.messages.repository.AttachmentRepository;
import com.example.messengerbackend.messages.repository.ChatRepository;
import com.example.messengerbackend.messages.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Controller // Используем обычный @Controller для работы с WebSocket (STOMP)
@RequiredArgsConstructor
public class MessageController {

    // Шаблон для рассылки сообщений через брокер
    private final SimpMessagingTemplate messagingTemplate;
    private final FilesMetaDataFacade filesMetaDataFacade;
    private final AttachmentRepository attachmentRepository;

    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;

    /**
     * Этот метод обрабатывает сообщения, отправленные фронтендом на префикс /app/chat/{chatId}
     */
    @MessageMapping("/chat/{chatId}")
    public void processMessage(@DestinationVariable String chatId, @Payload MessageRequest request) {
        Chat chat = chatRepository.findById(UUID.fromString(chatId)).orElseThrow();

        // 1. Сохраняем сообщение
        Message message = new Message();
        message.setChat(chat);
        message.setSenderId(request.senderId());
        message.setContent(request.content());
        Message savedMessage = messageRepository.save(message);

        // 2. Сохраняем вложения
        List<Attachment> savedAttachments = new ArrayList<>();
        if (request.fileIds() != null && !request.fileIds().isEmpty()) {
            for (Long fId : request.fileIds()) {
                // Получаем инфо о файле (имя, тип)
                var meta = filesMetaDataFacade.findFileMetadataById(fId);

                Attachment attachment = Attachment.builder()
                        .messageId(savedMessage.getId())
                        .chatId(chat.getId())
                        .fileId(fId)
                        .filename(meta.fileName())
                        .mimeType(meta.mimeType())
                        .logicType(meta.mimeType().startsWith("image/") ? "IMAGE" : "FILE")
                        .build();

                savedAttachments.add(attachmentRepository.save(attachment));
            }
        }

        // 3. ПРИКРЕПЛЯЕМ ФАЙЛЫ К СООБЩЕНИЮ ДЛЯ ФРОНТЕНДА
        savedMessage.setAttachments(savedAttachments);

        // 4. Рассылаем
        messagingTemplate.convertAndSend("/topic/chat/" + chatId, savedMessage);
    }

    // Вспомогательный метод для определения типа (картинка или документ)
    private String determineLogicType(String mimeType) {
        if (mimeType != null && mimeType.startsWith("image/")) return "IMAGE";
        return "FILE";
    }
}