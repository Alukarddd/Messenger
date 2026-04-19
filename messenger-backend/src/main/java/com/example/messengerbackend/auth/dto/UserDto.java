package com.example.messengerbackend.auth.dto;

import lombok.Builder;

@Builder
public record UserDto(
        int id,
        String name,
        String surname,
        String username
        ) {
}
