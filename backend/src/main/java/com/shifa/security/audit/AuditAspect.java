package com.shifa.security.audit;

import com.shifa.security.annotation.PhiAccess;
import com.shifa.security.dto.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component("securityAuditAspect")
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditService auditService;

    @AfterReturning("@annotation(phiAccess)")
    public void audit(JoinPoint jp, PhiAccess phiAccess) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal))
            return;

        String ip = "unknown";
        try {
            var attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                String xff = attrs.getRequest().getHeader("X-Forwarded-For");
                ip = (xff != null) ? xff.split(",")[0].trim() : attrs.getRequest().getRemoteAddr();
            }
        } catch (Exception ignored) {
        }

        auditService.logPhiAccess(
                principal.getUserId(),
                principal.getRole(),
                phiAccess.action(),
                phiAccess.resource(),
                null,
                ip);
    }
}
