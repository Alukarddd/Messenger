package com.example.messengerbackend.FileStorage.dto;

import lombok.Builder;


import java.sql.Timestamp;

@Builder
public record FileMetadataDto(
        long id,
        String fileName,
        long fileSize,
        Timestamp uploadDate,
        String mimeType
) {}
