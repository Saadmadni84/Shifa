package com.shifa.common.audit;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
@Service
public class AuditLogService {

    @Async
    public void logAction(String action, String resourceType, String resourceId, String status, String details) {
        log.debug("Audit: {} on {} ({}) - {}", action, resourceType, status, details);
    }
}
