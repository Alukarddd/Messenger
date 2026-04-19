package com.example.messengerbackend.FileStorage.dto;

import org.springframework.core.io.Resource;

public record DownloadFileResponse(
        String fileName,
        String mimeType,
        Resource resource
) {
}
