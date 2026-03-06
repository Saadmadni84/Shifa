package com.shifa.domain.reminder;

import org.springframework.context.ApplicationEvent;

public class ReminderDueEvent extends ApplicationEvent {
    private final Reminder reminder;

    public ReminderDueEvent(Object source, Reminder reminder) {
        super(source);
        this.reminder = reminder;
    }

    public Reminder getReminder() {
        return reminder;
    }
}
