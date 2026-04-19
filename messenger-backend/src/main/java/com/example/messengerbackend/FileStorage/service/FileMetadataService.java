package com.example.messengerbackend.FileStorage.service;

import com.example.messengerbackend.FileStorage.dto.DeleteFileResponse;
import com.example.messengerbackend.FileStorage.dto.DownloadFileResponse;
import com.example.messengerbackend.FileStorage.dto.FileMetadataDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FileMetadataService {
    List<FileMetadataDto> findAll();

    List<DeleteFileResponse> deleteFile(List<Long>filesIds);

    DownloadFileResponse downloadFile(long id);

    List<FileMetadataDto> saveFiles(List<MultipartFile> files);

    FileMetadataDto getFileMetadata(long id);
}
