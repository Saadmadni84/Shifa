package com.shifa.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * ShifaAuthEntryPoint — returns JSON 401 when an unauthenticated request
 * tries to access a protected resource.
 *
 * Without this, Spring returns an HTML error page.
 *
 * Triggered when (examples):
 *  • Missing JWT token on protected endpoint
 *  • Malformed JWT token
 *  • Expired JWT token
 *
 * Response shape (matches ErrorResponse from common/exception):
 * {
 *   "timestamp": "2024-06-01T14:30:00",
 *   "status": 401,
 *   "errorCode": "UNAUTHORIZED",
 *   "message": "Authentication required. Please provide a valid JWT token.",
 *   "path": "/api/v1/protected-endpoint"
 * }
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ShifaAuthEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        log.warn("Authentication failed | method={} | path={} | error={}",
            request.getMethod(), request.getRequestURI(), authException.getMessage());

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status",    HttpStatus.UNAUTHORIZED.value());
        body.put("errorCode", "UNAUTHORIZED");
        body.put("message",   "Authentication required. Please provide a valid JWT token.");
        body.put("path",      request.getRequestURI());

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
