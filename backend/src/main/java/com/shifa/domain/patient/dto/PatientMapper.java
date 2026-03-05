package com.shifa.domain.patient.dto;

import com.shifa.common.enums.Language;
import com.shifa.common.mapper.GlobalMapperConfig;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.visit.Visit;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Mapper(config = GlobalMapperConfig.class)
public interface PatientMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "visits", ignore = true)
    @Mapping(target = "doctors", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(source = "preferredLanguage", target = "preferredLanguage",
             qualifiedByName = "stringToLanguage")
    Patient toEntity(PatientCreateRequest request);

    @Mapping(target = "age", expression = "java(patient.getAge())")
    @Mapping(target = "fullName", expression = "java(patient.getFullName())")
    @Mapping(target = "preferredLanguageDisplay",
             expression = "java(patient.getPreferredLanguage().getDisplayName())")
    @Mapping(target = "totalVisits",
             expression = "java(patient.getVisits() != null ? patient.getVisits().size() : 0)")
    @Mapping(target = "lastVisitDate", source = "patient", qualifiedByName = "lastVisitDate")
    @Mapping(target = "lastDiagnosis", ignore = true)
    PatientResponse toResponse(Patient patient);

    @Mapping(target = "fullName", expression = "java(patient.getFullName())")
    @Mapping(target = "age", expression = "java(patient.getAge())")
    @Mapping(target = "hasChronicConditions",
             expression = "java(patient.getChronicConditions() != null && !patient.getChronicConditions().isEmpty())")
    @Mapping(target = "totalVisits",
             expression = "java(patient.getVisits() != null ? patient.getVisits().size() : 0)")
    @Mapping(target = "lastVisitDate", source = "patient", qualifiedByName = "lastVisitDate")
    @Mapping(target = "lastDiagnosis", ignore = true)
    PatientSummaryResponse toSummaryResponse(Patient patient);

    List<PatientSummaryResponse> toSummaryResponseList(List<Patient> patients);

    @Named("stringToLanguage")
    default Language stringToLanguage(String lang) {
        if (lang == null) return Language.EN;
        return Language.valueOf(lang.toUpperCase());
    }

    @Named("lastVisitDate")
    default LocalDate lastVisitDate(Patient patient) {
        if (patient.getVisits() == null || patient.getVisits().isEmpty()) return null;
        return patient.getVisits().stream()
            .map(Visit::getVisitDate)
            .max(Comparator.naturalOrder())
            .orElse(null);
    }
}
