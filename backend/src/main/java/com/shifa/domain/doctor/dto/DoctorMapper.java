package com.shifa.domain.doctor.dto;

import com.shifa.common.mapper.GlobalMapperConfig;
import com.shifa.domain.doctor.Clinic;
import com.shifa.domain.doctor.Doctor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = GlobalMapperConfig.class)
public interface DoctorMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deleteReason", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "clinicName", ignore = true)
    @Mapping(target = "clinicAddress", ignore = true)
    @Mapping(target = "profilePhotoUrl", ignore = true)
    @Mapping(target = "totalPatients", ignore = true)
    @Mapping(target = "totalVisits", ignore = true)
    @Mapping(target = "digestEnabled", ignore = true)
    @Mapping(target = "available", constant = "true")
    Doctor toEntity(DoctorRegisterRequest request);

    Clinic toClinicEntity(ClinicRequest request);

    @Mapping(target = "fullName", expression = "java(doctor.getFirstName() + \" \" + doctor.getLastName())")
    DoctorProfileResponse toResponse(Doctor doctor);

    ClinicResponse toClinicResponse(Clinic clinic);

    @Mapping(target = "fullName", expression = "java(doctor.getFirstName() + \" \" + doctor.getLastName())")
    @Mapping(target = "clinicName", source = "clinic.name")
    DoctorSummaryResponse toSummaryResponse(Doctor doctor);
}
