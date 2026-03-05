package com.shifa.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * ShifaAccessDeniedHandler — returns JSON 403 when an authenticated user
 * tries to access a resource outside their role.
 *
 * Without this, Spring returns an HTML error page.
 *
 * Triggered when (examples):
 *  • DOCTOR tries GET /api/v1/admin/stats
 *  • RECEPTIONIST tries POST /api/v1/visits (doctor-only)
 *
 * Response shape (matches ErrorResponse from common/exception):
 * {
 *   "timestamp": "2024-06-01T14:30:00",
 *   "status": 403,
 *   "errorCode": "FORBIDDEN",
 *   "message": "You do not have permission to access this resource.",
 *   "path": "/api/v1/admin/stats"
 * }
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ShifaAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest  request,
                       HttpServletResponse response,
                       AccessDeniedException ex) throws IOException {

        String actor = request.getUserPrincipal() != null
            ? request.getUserPrincipal().getName()
            : "anonymous";

        log.warn("Access denied | user={} | method={} | path={}",
            actor, request.getMethod(), request.getRequestURI());

        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status",    HttpStatus.FORBIDDEN.value());
        body.put("errorCode", "FORBIDDEN");
        body.put("message",   "You do not have permission to access this resource.");
        body.put("path",      request.getRequestURI());

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
