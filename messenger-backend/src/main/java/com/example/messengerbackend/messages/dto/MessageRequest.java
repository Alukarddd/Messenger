package com.example.messengerbackend.messages.dto;

import java.util.List;

public record MessageRequest(
        String content,
        int senderId,
        List<Long> fileIds // Добавляем список ID вложений
) {}