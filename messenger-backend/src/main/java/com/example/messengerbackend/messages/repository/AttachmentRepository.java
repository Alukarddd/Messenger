package com.example.messengerbackend.messages.repository;

import com.example.messengerbackend.messages.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {

    // Найти все вложения чата (для вкладки "Медиа, файлы, ссылки")
    List<Attachment> findAllByChatIdOrderByCreatedAtDesc(UUID chatId);

    // Найти только конкретный тип, например только изображения
    List<Attachment> findAllByChatIdAndLogicType(UUID chatId, String logicType);
}