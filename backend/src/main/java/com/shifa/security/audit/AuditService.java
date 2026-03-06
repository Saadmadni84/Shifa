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
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async("auditExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logLogin(UUID userId, String ip, boolean success) {
        save(AuditLog.builder()
                .userId(userId).userRole("UNKNOWN").actionType("LOGIN")
                .resourceType("AUTH").phiAccessed(false)
                .ipAddress(ip).success(success).accessedAt(LocalDateTime.now())
                .build());
    }

    @Async("auditExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logLogout(UUID userId, String ip) {
        save(AuditLog.builder()
                .userId(userId).actionType("LOGOUT")
                .resourceType("AUTH").phiAccessed(false)
                .ipAddress(ip).success(true).accessedAt(LocalDateTime.now())
                .build());
    }

    @Async("auditExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logRegistration(UUID userId, String ip) {
        save(AuditLog.builder()
                .userId(userId).actionType("REGISTER")
                .resourceType("AUTH").phiAccessed(false)
                .ipAddress(ip).success(true).accessedAt(LocalDateTime.now())
                .build());
    }

    @Async("auditExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logPhiAccess(UUID userId, String role, String actionType,
            String resourceType, UUID resourceId, String ip) {
        save(AuditLog.builder()
                .userId(userId).userRole(role).actionType(actionType)
                .resourceType(resourceType).resourceId(resourceId)
                .phiAccessed(true)
                .ipAddress(ip).success(true).accessedAt(LocalDateTime.now())
                .build());
    }

    private void save(AuditLog logRecord) {
        try {
            auditLogRepository.save(logRecord);
        } catch (Exception e) {
            log.error("[AuditService] Failed to write audit log: {}", e.getMessage());
        }
    }
}
