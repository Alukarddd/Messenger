package com.example.messengerbackend.auth.dto;

public record UserRegisterDto(
        String name,
        String surname,
        String username,
        String password,
        String email
) {
}
