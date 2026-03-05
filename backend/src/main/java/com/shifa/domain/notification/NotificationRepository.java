package com.shifa.domain.notification;

import com.shifa.common.enums.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    
    @Modifying
    @Query("UPDATE Notification n SET n.status = :status WHERE n.externalMessageId = :externalId")
    void updateStatusByExternalId(@Param("externalId") String externalId, @Param("status") NotificationStatus status);
}
