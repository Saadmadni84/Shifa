package com.shifa.domain.reminder.dto;

import com.shifa.common.mapper.GlobalMapperConfig;
import com.shifa.domain.reminder.Reminder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(config = GlobalMapperConfig.class)
public interface ReminderMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deleteReason", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "medication", ignore = true)
    @Mapping(target = "reminderText", ignore = true)
    @Mapping(target = "nextTriggerAt", ignore = true)
    @Mapping(target = "recurrence", ignore = true)
    @Mapping(target = "recurrenceTimes", ignore = true)
    @Mapping(target = "channel", ignore = true)
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "lastSentAt", ignore = true)
    @Mapping(target = "timesSent", constant = "0")
    Reminder toEntity(ReminderCreateRequest request);

    @Mapping(target = "patientId", source = "patient.id")
    @Mapping(target = "visitId", source = "medication.prescription.visit.id")
    @Mapping(target = "prescriptionId", source = "medication.prescription.id")
    @Mapping(target = "medicationName", source = "medication.name")
    @Mapping(target = "dosage", source = "medication.dosage")
    @Mapping(target = "instructions", source = "medication.instructions")
    @Mapping(target = "scheduleTime", expression = "java(reminder.getNextTriggerAt() != null ? reminder.getNextTriggerAt().toLocalTime() : null)")
    @Mapping(target = "frequency", source = "recurrence")
    @Mapping(target = "nextRunTime", source = "nextTriggerAt")
    ReminderResponse toResponse(Reminder reminder);

    List<ReminderResponse> toResponseList(List<Reminder> reminders);
}
