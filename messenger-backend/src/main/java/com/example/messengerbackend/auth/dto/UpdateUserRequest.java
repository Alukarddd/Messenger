package com.example.messengerbackend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateUserRequest(
        @NotBlank
        Integer id,
        @NotBlank
        String name,
        String surname,

        @NotBlank
        String username,
        String status,
        String email
) {
}
