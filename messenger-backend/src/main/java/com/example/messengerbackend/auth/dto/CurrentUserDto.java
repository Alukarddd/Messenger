package com.example.messengerbackend.auth.dto;

import lombok.Builder;

import java.sql.Timestamp;

@Builder
public record CurrentUserDto(int id,
                             String name,
                             String surname,
                             String username,
                             String status,
                             String email,
                             Timestamp created
) {

}
