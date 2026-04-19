package com.example.messengerbackend.auth.exceptions;

public class ExistsUserRequestException extends RuntimeException {
    public ExistsUserRequestException(String message) {
        super(message);
    }
}
