package com.shifa.domain.audit.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditLogResponse {

    Long id;
    String entityName;
    String entityId;
    String action;
    String changedBy;
    String changes;
    String ipAddress;
    LocalDateTime createdAt;
}
