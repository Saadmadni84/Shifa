package com.shifa.domain.reminder;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component("domainReminderScheduler")
@Slf4j
@RequiredArgsConstructor
public class ReminderScheduler {

    private final ReminderRepository reminderRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void processReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cutoff = now.plusMinutes(1);

        List<Reminder> dueReminders = reminderRepository
            .findDueReminders(now, cutoff);

        log.debug("Processing {} due reminders", dueReminders.size());

        dueReminders.forEach(reminder -> {
            try {
                eventPublisher.publishEvent(new ReminderDueEvent(this, reminder));
                updateNextTrigger(reminder, now);
            } catch (Exception e) {
                log.error("Failed to process reminder {}", reminder.getId(), e);
            }
        });
    }

    private void updateNextTrigger(Reminder reminder, LocalDateTime now) {
        switch (reminder.getRecurrence()) {
            case DAILY -> reminder.setNextTriggerAt(reminder.getNextTriggerAt().plusDays(1));
            case TWICE_DAILY -> reminder.setNextTriggerAt(reminder.getNextTriggerAt().plusHours(12));
            case THRICE_DAILY -> reminder.setNextTriggerAt(reminder.getNextTriggerAt().plusHours(8));
            case ONCE -> reminder.setActive(false);
            default -> reminder.setActive(false);
        }

        if (reminder.getEndDate() != null &&
            reminder.getNextTriggerAt().toLocalDate().isAfter(reminder.getEndDate())) {
            reminder.setActive(false);
        }

        reminder.setTimesSent(reminder.getTimesSent() + 1);
        reminder.setLastSentAt(now);
        reminderRepository.save(reminder);
    }
}
