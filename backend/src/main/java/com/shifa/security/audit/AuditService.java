package com.shifa.security.audit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
public class AuditService {

    @Async("auditExecutor")
    public void logLogin(UUID userId, String ip, boolean success) {
        log.debug("Audit LOGIN: user={} ip={} success={}", userId, ip, success);
    }

    @Async("auditExecutor")
    public void logLogout(UUID userId, String ip) {
        log.debug("Audit LOGOUT: user={} ip={}", userId, ip);
    }

    @Async("auditExecutor")
    public void logRegistration(UUID userId, String ip) {
        log.debug("Audit REGISTER: user={} ip={}", userId, ip);
    }

    @Async("auditExecutor")
    public void logPhiAccess(UUID userId, String role, String actionType,
            String resourceType, UUID resourceId, String ip) {
        log.debug("Audit PHI: user={} role={} action={} resource={}/{} ip={}", userId, role, actionType, resourceType, resourceId, ip);
    }
}
