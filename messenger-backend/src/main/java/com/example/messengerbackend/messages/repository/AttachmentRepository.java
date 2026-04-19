package com.example.messengerbackend.messages.repository;

import com.example.messengerbackend.messages.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {
    // Найти все вложения (медиа) для конкретного чата
    List<Attachment> findAllByChatId(UUID chatId);

    // Найти вложения определенного типа (например, только картинки)
    List<Attachment> findAllByChatIdAndType(UUID chatId, String type);
}