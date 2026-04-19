package com.example.messengerbackend.messages.service;

import com.example.messengerbackend.auth.dto.UserDto;
import com.example.messengerbackend.auth.entity.User;
import com.example.messengerbackend.auth.facade.UserFacade;
import com.example.messengerbackend.messages.dto.ChatSummaryDto;
import com.example.messengerbackend.messages.entity.Chat;
import com.example.messengerbackend.messages.entity.ChatParticipant;
import com.example.messengerbackend.messages.repository.ChatParticipantRepository;
import com.example.messengerbackend.messages.repository.ChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatRepository chatRepository;
    private final ChatParticipantRepository participantRepository;
    private final UserFacade userFacade;

    @Transactional
    public Chat createPrivateChat(int creatorId, int targetId) {
        // 1. Проверяем, существует ли уже чат между этими пользователями
        Optional<UUID> existingChatId = participantRepository.findPrivateChatBetweenUsers(creatorId, targetId);

        if (existingChatId.isPresent()) {
            // Если чат найден, просто возвращаем его из базы
            return chatRepository.findById(existingChatId.get())
                    .orElseThrow(() -> new RuntimeException("Чат найден в связях, но отсутствует в таблице chats"));
        }

        // 2. Если чата нет, создаем новый объект Чата
        Chat chat = new Chat();
        chat.setType("PRIVATE");
        Chat savedChat = chatRepository.save(chat);

        // 3. Добавляем тебя (создателя) в участники
        participantRepository.save(ChatParticipant.builder()
                .chatId(savedChat.getId())
                .userId(creatorId)
                .build());

        // 4. Добавляем собеседника в участники
        participantRepository.save(ChatParticipant.builder()
                .chatId(savedChat.getId())
                .userId(targetId)
                .build());

        return savedChat;
    }

    public List<ChatSummaryDto> getUserChats(int userId) {
        // 1. Ищем все ID чатов, где участвует пользователь
        List<ChatParticipant> participations = participantRepository.findAllByUserId(userId);

        return participations.stream().map(p -> {
            // 2. Для каждого чата ищем ВТОРОГО участника (собеседника)
            List<ChatParticipant> allParticipants = participantRepository.findAllByChatId(p.getChatId());
            ChatParticipant partner = allParticipants.stream()
                    .filter(part -> part.getUserId() != userId)
                    .findFirst().orElse(p); // Если чат с самим собой

            UserDto partnerUser = userFacade.findById(partner.getUserId());
            Chat chat = chatRepository.findById(p.getChatId()).get();

            return ChatSummaryDto.builder()
                    .id(chat.getId())
                    .partnerName(partnerUser.name() + " " + partnerUser.surname())
                    .partnerUsername(partnerUser.username())
                    .type(chat.getType())
                    .lastMessage("Нажмите, чтобы начать общение")
                    .build();
        }).collect(Collectors.toList());
    }

}
