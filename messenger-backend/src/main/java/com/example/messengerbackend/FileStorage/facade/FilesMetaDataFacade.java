package com.example.messengerbackend.FileStorage.facade;

import com.example.messengerbackend.FileStorage.dto.FileMetadataDto;

public interface FilesMetaDataFacade {
    FileMetadataDto findFileMetadataById(long id);

}
