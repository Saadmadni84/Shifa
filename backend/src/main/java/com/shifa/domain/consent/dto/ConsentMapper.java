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
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deleteReason", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "granted", source = "optedIn")
    @Mapping(target = "grantedAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "revokedAt", ignore = true)
    @Mapping(target = "userAgent", ignore = true)
    @Mapping(target = "consentTextShown", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "purpose", ignore = true)
    PatientConsent toEntity(ConsentRequest request);

    @Mapping(target = "patientId", source = "patient.id")
    @Mapping(target = "optedIn", source = "granted")
    @Mapping(target = "source", ignore = true)
    @Mapping(target = "validUntil", ignore = true)
    @Mapping(target = "recordedAt", source = "createdAt")
    ConsentResponse toResponse(PatientConsent consent);

    List<ConsentResponse> toResponseList(List<PatientConsent> consents);
}
