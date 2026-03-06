package com.shifa.domain.reminder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, UUID> {
    
    @Query("""
        SELECT r FROM Reminder r
        WHERE r.active = true
        AND r.nextTriggerAt >= :now
        AND r.nextTriggerAt <= :cutoff
        AND r.deleted = false
        """)
    List<Reminder> findDueReminders(@Param("now") LocalDateTime now, @Param("cutoff") LocalDateTime cutoff);

    List<Reminder> findByPatientIdAndDeletedFalse(UUID patientId);
}
