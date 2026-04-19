package com.example.messengerbackend.auth.dto;

public record ExistsUserRequest(
        String username,
        String email
) {
}
