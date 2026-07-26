package com.shifa.domain.prescription.dto;

import com.shifa.common.mapper.GlobalMapperConfig;
import com.shifa.domain.prescription.Medication;
import com.shifa.domain.prescription.Prescription;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import java.util.List;

@Mapper(config = GlobalMapperConfig.class)
public interface PrescriptionMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deleteReason", ignore = true)
    @Mapping(target = "visit", ignore = true)
    @Mapping(target = "documentUrl", ignore = true)
    @Mapping(target = "documentOcrText", ignore = true)
    Prescription toEntity(PrescriptionCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deleteReason", ignore = true)
    @Mapping(target = "prescription", ignore = true)
    @Mapping(target = "purpose", ignore = true)
    @Mapping(target = "sideEffectsToWatch", ignore = true)
    Medication toMedicationEntity(MedicationRequest request);

    @Mapping(target = "visitId", source = "visit.id")
    PrescriptionResponse toResponse(Prescription prescription);

    @Mapping(target = "scheduleText", expression = "java(medication.getScheduleText())")
    @Mapping(target = "sideEffectsToWatch", expression = "java(java.util.Arrays.asList(medication.getSideEffectsToWatch() != null ? medication.getSideEffectsToWatch().split(\",\") : new String[0]))")
    MedicationResponse toMedicationResponse(Medication medication);

    List<MedicationResponse> toMedicationResponseList(List<Medication> medications);


}
