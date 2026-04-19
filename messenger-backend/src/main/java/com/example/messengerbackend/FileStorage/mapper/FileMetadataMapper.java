package com.example.messengerbackend.FileStorage.mapper;

import com.example.messengerbackend.FileStorage.dto.DeleteFileResponse;
import com.example.messengerbackend.FileStorage.dto.FileMetadataDto;
import com.example.messengerbackend.FileStorage.entity.FileMetadata;
import org.springframework.stereotype.Component;

@Component
public class FileMetadataMapper {

    public FileMetadataDto toDto(FileMetadata fileMetadata) {
        return FileMetadataDto.builder()
                .id(fileMetadata.getId())
                .fileName(fileMetadata.getOriginalFileName())
                .fileSize(fileMetadata.getFileSize())
                .mimeType(fileMetadata.getMimeType())
                .uploadDate(fileMetadata.getUploadDate())
                .build();
    }

    public DeleteFileResponse toDeleteFileResponse(FileMetadata fileMetadata, String message, String status ) {
        return DeleteFileResponse
                .builder()
                .message(message)
                .status(status)
                .fileId(fileMetadata.getId())
                .filename(fileMetadata.getOriginalFileName())
                .fileSize(fileMetadata.getFileSize())
                .build();
    }
}
