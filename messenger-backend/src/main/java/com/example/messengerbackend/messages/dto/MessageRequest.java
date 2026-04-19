package com.example.messengerbackend.messages.dto;

public record MessageRequest(
        String content,
        int senderId
) {}