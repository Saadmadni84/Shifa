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
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "visit", ignore = true)
    @Mapping(target = "prescription", ignore = true)
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "lastSentAt", ignore = true)
    @Mapping(target = "nextRunTime", ignore = true)
    Reminder toEntity(ReminderCreateRequest request);

    @Mapping(target = "patientId", source = "patient.id")
    @Mapping(target = "visitId", source = "visit.id")
    @Mapping(target = "prescriptionId", source = "prescription.id")
    ReminderResponse toResponse(Reminder reminder);

    List<ReminderResponse> toResponseList(List<Reminder> reminders);
}
