package com.example.messengerbackend.auth.facade;

import com.example.messengerbackend.auth.dto.UserDto;
import com.example.messengerbackend.auth.entity.User;
import com.example.messengerbackend.auth.exceptions.NoSuchUserException;
import com.example.messengerbackend.auth.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserFacadeImpl implements UserFacade {
    private final UsersRepository usersRepository;
    @Override
    public UserDto findById(int id) {
        User user = usersRepository.findById(id)
                .orElseThrow(() -> new NoSuchUserException("User not found"));
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .surname(user.getSurname())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
