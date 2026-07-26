package com.shifa.common.audit;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AuditLogService {

    @Async
    public void logAction(String action, String resourceType, String resourceId, String status, String details) {
        log.debug("Audit: {} on {} ({}) - {}", action, resourceType, status, details);
    }
}
