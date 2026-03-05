package com.shifa.common.aop;

import com.shifa.common.annotation.Audited;
import com.shifa.common.audit.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditLogService auditLogService;

    @Around("@annotation(audited)")
    public Object auditMethod(ProceedingJoinPoint joinPoint, Audited audited) throws Throwable {
        String action = audited.action();
        String resourceType = audited.resourceType();
        String resourceId = extractResourceId(joinPoint.getArgs());
        String status = "SUCCESS";
        String details = "Method execution successful";

        try {
            Object result = joinPoint.proceed();
            return result;
        } catch (Throwable ex) {
            status = "FAILURE";
            details = "Exception: " + ex.getClass().getSimpleName() + " - " + ex.getMessage();
            throw ex;
        } finally {
            auditLogService.logAction(action, resourceType, resourceId, status, details);
        }
    }

    private String extractResourceId(Object[] args) {
        if (args != null && args.length > 0) {
            for (Object arg : args) {
                if (arg instanceof UUID) {
                    return arg.toString();
                }
                if (arg instanceof String && arg.toString().length() == 36) { // Possible UUID string
                    return arg.toString();
                }
                if (arg instanceof Long) {
                    return arg.toString();
                }
            }
        }
        return null;
    }
}
