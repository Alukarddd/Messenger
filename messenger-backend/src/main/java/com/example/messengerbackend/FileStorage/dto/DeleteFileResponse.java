package com.example.messengerbackend.FileStorage.dto;

import lombok.Builder;

@Builder
public record DeleteFileResponse(
        long fileId,
        String filename,
        long fileSize,
        String status,
        String message
) {
}
