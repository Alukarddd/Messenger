package com.example.messengerbackend.FileStorage.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig {

    @Bean(name = "defaultStoragePath")
    public Path defaultStoragePath(@Value("${file.storage.path}") String storagePath) {
        try{
            Path path =  Paths.get(storagePath).toAbsolutePath().normalize();
            Files.createDirectories(path);
            return path;
        }catch (IOException exception){
            throw new RuntimeException("Не удалось создать директорию для хранения файлов", exception);
        }
    }
}
