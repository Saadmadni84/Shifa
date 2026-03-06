package com.shifa.domain.notification.dto;

import com.shifa.common.mapper.GlobalMapperConfig;
import com.shifa.domain.notification.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = GlobalMapperConfig.class)
public interface NotificationMapper {

    @Mapping(target = "patientId", source = "patient.id")
    NotificationResponse toResponse(Notification notification);

}
