package com.shifa.domain.reminder;

import com.shifa.domain.reminder.dto.ReminderCreateRequest;
import com.shifa.domain.reminder.dto.ReminderResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
@Tag(name = "Reminder")
@SecurityRequirement(name = "bearerAuth")
public class ReminderController {

    private final ReminderService reminderService;

    @PostMapping
    public ResponseEntity<ReminderResponse> scheduleReminder(
        @Valid @RequestBody ReminderCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(reminderService.scheduleReminder(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelReminder(@PathVariable UUID id) {
        reminderService.cancelReminder(id);
        return ResponseEntity.noContent().build();
    }
}
