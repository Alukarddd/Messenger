package com.example.messengerbackend.messages.mapper;

import com.example.messengerbackend.auth.dto.GetUserDto;
import com.example.messengerbackend.auth.dto.UserRegisterDto;
import com.example.messengerbackend.auth.entity.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public final class UserMapper {

    public GetUserDto toDto(User user) {
        return new GetUserDto(user.getId(), user.getName(), user.getSurname(), user.getUsername());
    }

    public User fromUserRegisterDto(UserRegisterDto userRegisterDto, PasswordEncoder passwordEncoder) {
        User user = new User();
        user.setEmail(userRegisterDto.email());
        user.setPassword(passwordEncoder.encode(userRegisterDto.password()));
        user.setUsername(userRegisterDto.username());
        user.setName(userRegisterDto.name());
        user.setSurname(userRegisterDto.surname());
        return user;
    }

}
