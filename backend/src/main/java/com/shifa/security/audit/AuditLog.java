package com.shifa.security.audit;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_user_date", columnList = "user_id, accessed_at"),
        @Index(name = "idx_audit_phi", columnList = "phi_accessed"),
        @Index(name = "idx_audit_resource", columnList = "resource_type, resource_id"),
})
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "user_role", length = 20)
    private String userRole;

    @Column(name = "action_type", length = 50, nullable = false)
    private String actionType;

    @Column(name = "resource_type", length = 50)
    private String resourceType;

    @Column(name = "resource_id")
    private UUID resourceId;

    @Column(name = "phi_accessed")
    private boolean phiAccessed;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "success")
    private boolean success;

    @Column(name = "failure_reason", length = 200)
    private String failureReason;

    @Column(name = "accessed_at", nullable = false)
    private LocalDateTime accessedAt;

    @Column(name = "extra_context", columnDefinition = "TEXT")
    private String extraContext;
}
