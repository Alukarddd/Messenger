package com.example.messengerbackend.auth.exception_handler;


import com.example.messengerbackend.FileStorage.exceptions.DownloadFileException;
import com.example.messengerbackend.FileStorage.exceptions.FileNotFoundException;
import com.example.messengerbackend.FileStorage.exceptions.SaveFileException;
import com.example.messengerbackend.auth.exceptions.ExistsUserRequestException;
import com.example.messengerbackend.auth.exceptions.NoSuchUserException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;


import java.util.Locale;

@RestControllerAdvice
@Slf4j
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final MessageSource messageSource;

   /* @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException exception) {
        log.warn("Возникло исключение: {}", exception.getMessage());
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Ошибка. " + exception.getMessage()));
    }*/

    @ExceptionHandler(NoSuchUserException.class)
    public ResponseEntity<ProblemDetail> handleNoSuchUserException(NoSuchUserException exception, Locale locale) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND,
                messageSource.getMessage("error.user_not_found", new Object[0], "error.user_not_found", locale));
        problemDetail.setProperty("error", exception.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(problemDetail);
    }

    @ExceptionHandler(ExistsUserRequestException.class)
    public ResponseEntity<ProblemDetail> handleCheckUsernameOrEmailMethodException(ExistsUserRequestException exception, Locale locale) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,
                messageSource.getMessage("error.exists_user_request_exception", new Object[0], "error.exists_user_request_exception", locale));
        problemDetail.setProperty("error", exception.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(problemDetail);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ProblemDetail> handleAccessDeniedException(AccessDeniedException exception, Locale locale) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN,
                messageSource.getMessage("error.access_denied", new Object[0], "error.access_denied", locale));
        problemDetail.setProperty("error", exception.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(problemDetail);
    }

    @ExceptionHandler(FileNotFoundException.class)
    public ResponseEntity<ProblemDetail>handleFileNotFoundException(FileNotFoundException exception, Locale locale) {
        log.warn("Файл не найден {}", exception.getMessage());
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND,
                messageSource.getMessage("errors.file_not_found", new Object[0], "errors.file_not_found", locale));
        problemDetail.setProperty("error", exception.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(problemDetail);
    }

    @ExceptionHandler(DownloadFileException.class)
    public ResponseEntity<ProblemDetail>handleDownloadFileException(DownloadFileException exception, Locale locale) {
        log.warn("Произошла ошибка при скачивании файла: {}", exception.getMessage());
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND,
                messageSource.getMessage("errors.download_exception", new Object[0], "errors.download_exception", locale));
        problemDetail.setProperty("error", exception.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(problemDetail);
    }

    @ExceptionHandler(SaveFileException.class)
    public ResponseEntity<ProblemDetail>handleSaveFileException(SaveFileException exception, Locale locale) {
        log.warn("Произошла ошибка при сохранении файла: {}", exception.getMessage());
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR,
                messageSource.getMessage("errors.errors.save_file_error", new Object[0], "errors.save_file_error", locale));
        problemDetail.setProperty("error", exception.getMessage());
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(problemDetail);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ProblemDetail> handleRuntimeException(RuntimeException exception, Locale locale) {
        log.error("Произошла непредвиденная ошибка: {}", exception.getMessage(), exception);
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR,
                messageSource.getMessage("errors.runtime_exception", null, "Внутренняя ошибка сервера", locale));
        problemDetail.setProperty("error", exception.getMessage());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(problemDetail);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ProblemDetail> handleMaxSizeException(MaxUploadSizeExceededException exception, Locale locale) {
        log.warn("Попытка загрузить слишком большой файл: {}", exception.getMessage());
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.PAYLOAD_TOO_LARGE,
                messageSource.getMessage("errors.file_too_large", null, "Размер файла превышает допустимый лимит", locale));
        problemDetail.setProperty("error", exception.getMessage());

        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(problemDetail);
    }

}