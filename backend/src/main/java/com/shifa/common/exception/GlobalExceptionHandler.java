package com.shifa.common.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(VisitNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleVisitNotFound(VisitNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse.of("VISIT_NOT_FOUND", e.getMessage()));
    }

    @ExceptionHandler(AIProcessingException.class)
    public ResponseEntity<ErrorResponse> handleAIError(AIProcessingException e) {
        log.error("AI processing error", e);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(ErrorResponse.of("AI_ERROR", "AI processing failed. Please retry."));
    }

    @ExceptionHandler(ConsentRequiredException.class)
    public ResponseEntity<ErrorResponse> handleConsentRequired(ConsentRequiredException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ErrorResponse.of("CONSENT_REQUIRED",
                "Patient consent is required to process this request. " +
                "Please obtain consent before proceeding."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors().forEach(fe ->
            fieldErrors.putIfAbsent(fe.getField(), fe.getDefaultMessage()));

        String message = e.getBindingResult().getFieldErrors().stream()
            .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
            .collect(Collectors.joining(", "));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("VALIDATION_ERROR")
                .message(message)
                .validationErrors(fieldErrors)
                .build());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), "BAD_REQUEST", e.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException e) {
        HttpStatus status = e.getMessage() != null && e.getMessage().toLowerCase().contains("already")
            ? HttpStatus.CONFLICT
            : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status)
            .body(ErrorResponse.of(status.value(), "BAD_REQUEST", e.getMessage()));
    }

    @ExceptionHandler(ShifaException.class)
    public ResponseEntity<ErrorResponse> handleShifaException(ShifaException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), "BAD_REQUEST", e.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException e) {
        String message = "This record already exists or violates data constraints.";
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ErrorResponse.of(HttpStatus.CONFLICT.value(), "CONFLICT", message));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ErrorResponse.of(HttpStatus.UNAUTHORIZED.value(), "UNAUTHORIZED", "Invalid credentials"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception e) {
        log.error("Unhandled exception", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse.of(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "INTERNAL_ERROR",
                "Something went wrong. Please try again."));
    }
}
