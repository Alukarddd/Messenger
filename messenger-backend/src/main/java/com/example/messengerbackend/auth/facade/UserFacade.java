package com.example.messengerbackend.auth.facade;
import com.example.messengerbackend.auth.dto.UserDto;

public interface UserFacade {
    UserDto findById(int id);

}
