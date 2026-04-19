package com.example.messengerbackend.messages.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173") // Разрешаем запросы от React-приложения
public class UserController {

    /*@Autowired
    private UserRepository userRepository;

    // Метод, чтобы получить список всех пользователей
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Метод, чтобы обновить статус конкретного пользователя
    @PostMapping("/{id}/status")
    public void updateStatus(@PathVariable UUID id, @RequestBody String newStatus) {
        // Находим пользователя по ID, меняем статус и сохраняем обратно в базу
        User user = userRepository.findById(id).orElseThrow();
        user.setStatusText(newStatus);
        userRepository.save(user);
    }*/
}