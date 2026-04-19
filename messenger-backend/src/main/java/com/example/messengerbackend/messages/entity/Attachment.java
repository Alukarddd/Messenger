package com.example.messengerbackend.messages.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "attachments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "attachment_id")
    private UUID id;

    @Column(name = "message_id")
    private UUID messageId;

    @Column(name = "chat_id")
    private UUID chatId;

    @Column(name = "file_id")
    private long fileId; // Ссылка на ID из FileMetadataDto

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "logic_type")
    private String logicType;

    private String filename;

    @CreationTimestamp
    private Timestamp createdAt;
}