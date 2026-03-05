package com.shifa.domain.reminder;

import com.shifa.domain.reminder.dto.ReminderCreateRequest;
import com.shifa.domain.reminder.dto.ReminderResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class ReminderService {

    private final ReminderRepository reminderRepository;

    public ReminderResponse scheduleReminder(ReminderCreateRequest request) {
        return null; // TODO implement
    }

    public void cancelReminder(UUID id) {
        // TODO implement
    }
}
