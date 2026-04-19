package com.example.messengerbackend.FileStorage.facade;

import com.example.messengerbackend.FileStorage.dto.FileMetadataDto;
import com.example.messengerbackend.FileStorage.service.FileMetadataService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FilesMetaDataFacadeImpl implements FilesMetaDataFacade {
    private final FileMetadataService fileMetadataService;
    @Override
    public FileMetadataDto findFileMetadataById(long id) {
        return fileMetadataService.getFileMetadata(id);
    }
}
