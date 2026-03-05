package com.shifa.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ReminderScheduler {

    @Scheduled(cron = "0 0/30 * * * *")
    public void dispatchMedicationReminders() {
    }
}
