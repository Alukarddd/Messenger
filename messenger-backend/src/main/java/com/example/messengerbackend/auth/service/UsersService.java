package com.example.messengerbackend.auth.service;

import com.example.messengerbackend.auth.dto.CurrentUserDto;
import com.example.messengerbackend.auth.dto.GetUserDto;
import com.example.messengerbackend.auth.dto.UpdateUserRequest;
import com.example.messengerbackend.auth.dto.UserRegisterDto;
import com.example.messengerbackend.auth.entity.Role;
import com.example.messengerbackend.auth.entity.User;
import com.example.messengerbackend.auth.exceptions.NoSuchUserException;
import com.example.messengerbackend.auth.exceptions.NoSuchUserRoleException;
import com.example.messengerbackend.auth.repository.UserRolesRepository;
import com.example.messengerbackend.auth.repository.UsersRepository;
import com.example.messengerbackend.messages.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class UsersService {

    private final PasswordEncoder passwordEncoder;
    private final UsersRepository usersRepository;
    private final UserRolesRepository userRolesRepository;

    private final UserMapper userMapper;

    public Iterable<GetUserDto> findAllUsers() {
        List<GetUserDto> users = new ArrayList<>();
        Iterable<User> usersFromDatabase = usersRepository.findAll();
        usersFromDatabase.forEach(user -> users.add(userMapper.toDto(user)));
        return users;
    }

    public boolean checkCredentials(String username, String password) {
        Optional<User> userOptional = usersRepository.findByUsername(username);
        return userOptional
                .map(user -> passwordEncoder.matches(password, user.getPassword()))
                .orElse(false);
    }


    public User getUserByUsername(String username) {
        return usersRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchUserException("User with username %s not found".formatted(username)));
    }

    public GetUserDto findUserByEmail(String email) {
        User user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchUserException("Пользователь с заданным адресом электронной почты не найден."));
        return userMapper.toDto(user);
    }

    public User findUserById(int id) {
        return usersRepository.findById(id)
                .orElseThrow(() -> new NoSuchUserException("User with id %d not found".formatted(id)));
    }


    public GetUserDto findUserDtoById(int id) {
        User user = findUserById(id);
        return new GetUserDto(user.getId(), user.getName(), user.getSurname(), user.getUsername());
    }

    public CurrentUserDto findCurrentUserDtoById(int id) {
        User user = findUserById(id);
        return CurrentUserDto.builder()
                .surname(user.getSurname())
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .created(user.getCreatedAt())
                .id(user.getId())
                .status(user.getStatusText())
                .build();
    }

    public String findUserInitialsById(int id) {
        User user = findUserById(id);
        return user.getName() + " " + user.getSurname();
    }


    public List<String> getUserRoles(int id) {
        List<Role> roles = userRolesRepository.findByUserId(id);
        if (roles.isEmpty()) {
            throw new NoSuchUserRoleException("Roles for user with id %d not found".formatted(id));
        }
        return roles.stream()
                .map(Role::getName)
                .collect(Collectors.toList());
    }


    @Transactional
    public GetUserDto saveUser(UserRegisterDto userRegisterDto) {
        User userToSave = userMapper.fromUserRegisterDto(userRegisterDto, passwordEncoder);
        User savedUser = usersRepository.save(userToSave);

        Role userRole = userRolesRepository.findRoleByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Default role ROLE_USER not found"));

        userRolesRepository.insertIntoUserRoles(savedUser.getId(), userRole.getId());
        return userMapper.toDto(savedUser);
    }

    public CurrentUserDto updateUserInfo(UpdateUserRequest updateUserRequest, int currentUserId) {
        User userToUpdate = findUserById(updateUserRequest.id());

        if (userToUpdate.getId() != currentUserId) {
            throw new AccessDeniedException("У вас нет доступа для выполнения данного действия");
        }

        userToUpdate.setSurname(Objects.isNull(updateUserRequest.surname()) ? "" : updateUserRequest.surname());
        userToUpdate.setName(updateUserRequest.name());
        userToUpdate.setStatusText(updateUserRequest.status());
        userToUpdate.setEmail(updateUserRequest.email());
        var user = usersRepository.save(userToUpdate);
        return CurrentUserDto.builder()
                .surname(user.getSurname())
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .created(user.getCreatedAt())
                .id(user.getId())
                .status(user.getStatusText())
                .build();
    }


    public boolean existsByUsernameOrEmail(String username, String email) {
        return usersRepository.existsByUsernameOrEmail(username, email);
    }

    public void setPasswordForUserById(int userId, String password) {
        User user = findUserById(userId);
        user.setPassword(passwordEncoder.encode(password));
        usersRepository.save(user);
    }

    public List<GetUserDto> searchUsersByUsername(String username, int currentUserId) {
        // 1. Ищем в базе
        List<User> foundUsers = usersRepository.findByUsernameContainingIgnoreCase(username);

        // 2. Превращаем в DTO и фильтруем (чтобы не найти самого себя)
        return foundUsers.stream()
                .filter(user -> user.getId() != currentUserId)
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }
}