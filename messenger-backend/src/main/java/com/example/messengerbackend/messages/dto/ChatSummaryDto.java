package com.example.messengerbackend.messages.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record ChatSummaryDto(
        UUID id,
        String partnerName,
        String partnerUsername,
        String lastMessage,
        String type
) {}