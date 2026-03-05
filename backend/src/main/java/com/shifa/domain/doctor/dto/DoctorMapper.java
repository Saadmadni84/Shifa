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
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "user", ignore = true)
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
