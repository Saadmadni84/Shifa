package com.shifa.integration.whatsapp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WhatsAppDeliveryLogRepository extends JpaRepository<WhatsAppDeliveryLog, Long> {

    @Query("SELECT log FROM WhatsAppDeliveryLog log WHERE log.synced = false AND log.status IN ('DELIVERED', 'READ')")
    List<WhatsAppDeliveryLog> findUnsyncedStatusUpdates();
}
