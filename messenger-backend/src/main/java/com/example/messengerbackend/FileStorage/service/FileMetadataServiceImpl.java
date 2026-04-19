package com.example.messengerbackend.FileStorage.service;

import com.example.messengerbackend.FileStorage.dto.DeleteFileResponse;
import com.example.messengerbackend.FileStorage.dto.DownloadFileResponse;
import com.example.messengerbackend.FileStorage.dto.FileMetadataDto;
import com.example.messengerbackend.FileStorage.entity.FileMetadata;
import com.example.messengerbackend.FileStorage.exceptions.DownloadFileException;
import com.example.messengerbackend.FileStorage.exceptions.FileNotFoundException;
import com.example.messengerbackend.FileStorage.exceptions.SaveFileException;
import com.example.messengerbackend.FileStorage.mapper.FileMetadataMapper;
import com.example.messengerbackend.FileStorage.repository.FileMetadataRepository;
import liquibase.util.StringUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class FileMetadataServiceImpl implements FileMetadataService {

    private final FileMetadataRepository fileMetadataRepository;

    private final FileMetadataMapper fileMetadataMapper;

    private final Path fileStorageLocation;

    @Override
    public List<FileMetadataDto> findAll() {
        Iterable<FileMetadata> fileMetadataIterable = fileMetadataRepository.findAll();
        return StreamSupport.stream(fileMetadataIterable.spliterator(), false)
                .map(fileMetadataMapper::toDto)
                .toList();
    }

    @Override
    public DownloadFileResponse downloadFile(long id) {
        FileMetadata fileMetadata = fileMetadataRepository.findById(id)
                .orElseThrow(() -> new FileNotFoundException("Файл не найден"));
        try {
            Path filePath = fileStorageLocation.resolve(fileMetadata.getStoredFileName()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return new DownloadFileResponse(fileMetadata.getOriginalFileName(), fileMetadata.getMimeType().toString(), resource);
            } else {
                throw new FileNotFoundException("Файл не найден на диске или недоступен для чтения.");
            }
        } catch (MalformedURLException exception) {
            throw new DownloadFileException("Ошибка при формировании пути к файлу: " + fileMetadata.getOriginalFileName(), exception);
        }
    }

    @Transactional
    @Override
    public List<FileMetadataDto> saveFiles(List<MultipartFile> files) {
        List<FileMetadata> filesMetadataList = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }
            try {
                String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

                String fileExtension = getFileExtension(originalFileName);
                String storedFileName = UUID.randomUUID()  + fileExtension;

                Path targetFilePath = fileStorageLocation.resolve(storedFileName);

                try (InputStream inputStream = file.getInputStream()) {
                    Files.copy(inputStream, targetFilePath, StandardCopyOption.REPLACE_EXISTING);
                }

                FileMetadata fileMetadata = FileMetadata
                        .builder()
                        .originalFileName(originalFileName)
                        .storedFileName(storedFileName)
                        .fileSize(file.getSize())
                        .mimeType(file.getContentType())
                        .uploadDate(Timestamp.from(Instant.now()))
                        .build();

                filesMetadataList.add(fileMetadata);
            } catch (IOException exception) {
                throw new SaveFileException("Ошибка при сохранении файла " + file.getOriginalFilename(), exception);
            }
        }

        Iterable<FileMetadata> savedFilesMetadata = fileMetadataRepository.saveAll(filesMetadataList);
        return StreamSupport.stream(savedFilesMetadata.spliterator(), false)
                .map(fileMetadataMapper::toDto)
                .toList();
    }

    @Override
    public FileMetadataDto getFileMetadata(long id) {
        var FileMetaData =  fileMetadataRepository.findById(id).orElseThrow();
        return fileMetadataMapper.toDto(FileMetaData);
    }

    private String getFileExtension(String fileName) {
        if (fileName != null && fileName.contains(".")) {
            return fileName.substring(fileName.lastIndexOf("."));
        }
        return "";
    }


    @Transactional
    @Override
    public List<DeleteFileResponse> deleteFile(List<Long> filesIds) {
        Iterable<FileMetadata> filesInDatabase = fileMetadataRepository.findAllById(filesIds);

        Map<Long, FileMetadata> existingFilesMap = StreamSupport.stream(filesInDatabase.spliterator(), false)
                .collect(Collectors.toMap(FileMetadata::getId, file -> file));

        List<DeleteFileResponse> result = new ArrayList<>();
        List<FileMetadata> filesToDeleteFromDb = new ArrayList<>();

        for (Long id : filesIds) {
            if (existingFilesMap.containsKey(id)) {
                FileMetadata fileMetadata = existingFilesMap.get(id);
                Path targetFilePath = fileStorageLocation.resolve(fileMetadata.getStoredFileName());

                try {
                    Files.delete(targetFilePath);

                    result.add(DeleteFileResponse.builder()
                            .fileId(id)
                            .filename(fileMetadata.getOriginalFileName())
                            .fileSize(fileMetadata.getFileSize())
                            .status("Success")
                            .message("Файл успешно удален.")
                            .build());

                } catch (IOException exception) {
                    result.add(DeleteFileResponse.builder()
                            .fileId(id)
                            .filename(fileMetadata.getOriginalFileName())
                            .fileSize(fileMetadata.getFileSize())
                            .status("Error")
                            .message("Не удалось удалить файл с диска, возможно, что он уже был удален или перемещен.")
                            .build());
                }
                filesToDeleteFromDb.add(fileMetadata);
            }
            else {
                result.add(DeleteFileResponse.builder()
                        .fileId(id)
                        .filename(null)
                        .fileSize(0)
                        .status("Error")
                        .message("Файл не найден в базе данных.")
                        .build());
            }
        }
        if (!filesToDeleteFromDb.isEmpty()) {
            fileMetadataRepository.deleteAll(filesToDeleteFromDb);
        }

        return result;
    }
}
