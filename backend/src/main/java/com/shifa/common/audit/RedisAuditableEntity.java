package com.shifa.common.audit;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;

@Getter
@Setter
public abstract class RedisAuditableEntity {

    @Id
    private String id;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;

    private boolean deleted = false;

    private LocalDateTime deletedAt;

    private String deleteReason;

    public void softDelete() {
        this.deleted = true;
    }
}