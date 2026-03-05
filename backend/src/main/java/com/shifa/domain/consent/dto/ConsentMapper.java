package com.shifa.domain.consent.dto;

import com.shifa.common.mapper.GlobalMapperConfig;
import com.shifa.domain.consent.PatientConsent;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(config = GlobalMapperConfig.class)
public interface ConsentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "grantedAt", expression = "java(java.time.LocalDateTime.now())")
    PatientConsent toEntity(ConsentRequest request);

    @Mapping(target = "patientId", source = "patient.id")
    ConsentResponse toResponse(PatientConsent consent);

    List<ConsentResponse> toResponseList(List<PatientConsent> consents);
}
