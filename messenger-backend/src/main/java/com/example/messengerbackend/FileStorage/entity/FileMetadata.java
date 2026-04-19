package com.example.messengerbackend.FileStorage.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Entity
@Table(name = "file_metadata")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class FileMetadata {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String storedFileName;

    private String originalFileName;

    private long fileSize;

    private Timestamp uploadDate;

    private String mimeType;
}
