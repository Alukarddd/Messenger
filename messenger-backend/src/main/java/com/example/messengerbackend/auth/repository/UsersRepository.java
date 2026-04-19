package com.example.messengerbackend.auth.repository;


import com.example.messengerbackend.auth.entity.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface UsersRepository extends CrudRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Boolean existsByUsernameOrEmail(String username, String email);

    // Добавляем этот метод для поиска
    List<User> findByUsernameContainingIgnoreCase(String username);
}
