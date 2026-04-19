package com.example.messengerbackend.auth.exceptions;

public class NoSuchAuthException extends RuntimeException {
    public NoSuchAuthException(String message) {
        super(message);
    }
}
