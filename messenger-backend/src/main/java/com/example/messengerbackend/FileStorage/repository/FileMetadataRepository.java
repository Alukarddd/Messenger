package com.example.messengerbackend.FileStorage.repository;

import com.example.messengerbackend.FileStorage.entity.FileMetadata;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FileMetadataRepository extends CrudRepository<FileMetadata, Long> {

}
