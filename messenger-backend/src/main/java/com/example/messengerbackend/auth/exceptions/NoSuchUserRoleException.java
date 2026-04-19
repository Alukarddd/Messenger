package com.example.messengerbackend.auth.exceptions;

public class NoSuchUserRoleException extends RuntimeException {
    public NoSuchUserRoleException(String message) {
        super(message);
    }
}
