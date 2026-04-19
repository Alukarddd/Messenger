package com.example.messengerbackend.messages.controller;

import com.example.messengerbackend.messages.dto.ChatSummaryDto;
import com.example.messengerbackend.messages.entity.Chat;
import com.example.messengerbackend.messages.entity.Message;
import com.example.messengerbackend.messages.repository.MessageRepository;
import com.example.messengerbackend.messages.service.ChatService;
import com.example.messengerbackend.auth.exceptions.InvalidJwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final MessageRepository messageRepository;

    @PostMapping("/create-private/{targetUserId}")
    public Chat createChat(@PathVariable int targetUserId, Authentication authentication) {
        log.info("Creating chat with user id: {}", targetUserId);
        return chatService.createPrivateChat(getUserId(authentication), targetUserId);
    }

    @GetMapping("/my")
    public List<ChatSummaryDto> getMyChats(Authentication authentication) {
        log.info("Fetching chats for user");
        return chatService.getUserChats(getUserId(authentication));
    }

    // Получение истории сообщений (вызывается один раз при открытии чата)
    @GetMapping("/{chatId}/messages")
    public List<Message> getChatMessages(@PathVariable UUID chatId) {
        log.info("Fetching history for chat: {}", chatId);
        return messageRepository.findAllByChatIdOrderByCreatedAtAsc(chatId);
    }

    private int getUserId(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        if (jwt.getClaims().containsKey("userId")) {
            return Integer.parseInt(jwt.getClaim("userId").toString());
        } else {
            throw new InvalidJwtException("Jwt is invalid: claim 'userId' is missing");
        }
    }
}