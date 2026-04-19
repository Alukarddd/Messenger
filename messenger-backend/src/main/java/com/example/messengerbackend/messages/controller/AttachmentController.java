package com.example.messengerbackend.messages.controller;

import com.example.messengerbackend.messages.entity.Attachment;
import com.example.messengerbackend.messages.repository.AttachmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentRepository attachmentRepository;

    @GetMapping("/chat/{chatId}")
    public List<Attachment> getChatAttachments(@PathVariable UUID chatId) {
        // Убедись, что этот метод есть в AttachmentRepository
        return attachmentRepository.findAllByChatIdOrderByCreatedAtDesc(chatId);
    }
}