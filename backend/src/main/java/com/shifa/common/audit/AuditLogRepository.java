package com.shifa.common.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

// Disabled — duplicate of domain-level repository
// public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
public interface AuditLogRepository {
}
