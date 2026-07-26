package com.shifa.domain.visit.dto;

import com.shifa.common.enums.VisitStatus;
import com.shifa.common.enums.WhatsAppStatus;
import com.shifa.common.mapper.GlobalMapperConfig;
import com.shifa.domain.doctor.dto.DoctorMapper;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.patient.dto.PatientMapper;
import com.shifa.domain.prescription.dto.PrescriptionMapper;
import com.shifa.domain.visit.Visit;
import com.shifa.domain.vitals.dto.VitalsMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Mapper(config = GlobalMapperConfig.class,
        uses = { PatientMapper.class, DoctorMapper.class,
                 PrescriptionMapper.class, VitalsMapper.class })
public interface VisitMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deleteReason", ignore = true)
    @Mapping(target = "aiSummary", ignore = true)
    @Mapping(target = "aiSummaryJson", ignore = true)
    @Mapping(target = "patientSummaries", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "whatsappStatus", constant = "NOT_SENT")
    @Mapping(target = "patientPortalToken", ignore = true)
    @Mapping(target = "portalTokenExpiresAt", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "diagnosis", ignore = true)
    @Mapping(target = "prescription", ignore = true)
    @Mapping(target = "vitalSigns", ignore = true)
    @Mapping(target = "aiProcessedAt", ignore = true)
    @Mapping(target = "sentToPatientAt", ignore = true)
    @Mapping(target = "followUpNotes", ignore = true)
    @Mapping(target = "whatsappMessageId", ignore = true)
    @Mapping(target = "whatsappMetaMessageId", ignore = true)
    @Mapping(target = "whatsappSentAt", ignore = true)
    @Mapping(target = "aiErrorMessage", ignore = true)
    Visit toEntity(VisitCreateRequest request);

    @Mapping(target = "patient", source = "patient")
    @Mapping(target = "doctor", source = "doctor")
    @Mapping(target = "aiSummaryStatus", source = "visit", qualifiedByName = "aiStatus")
    @Mapping(target = "patientPortalUrl", source = "visit", qualifiedByName = "portalUrl")
    @Mapping(target = "portalExpiresAt", source = "portalTokenExpiresAt")
    @Mapping(target = "portalAccessValid", expression = "java(visit.isPortalAccessValid())")
    @Mapping(target = "patientSummaries", source = "visit", qualifiedByName = "summaryMap")
    @Mapping(target = "vitals", source = "vitalSigns")
    @Mapping(target = "whatsappDeliveredAt", ignore = true)
    @Mapping(target = "whatsappReadAt", ignore = true)
    VisitResponse toResponse(Visit visit);

    @Mapping(target = "patientId", source = "patient.id")
    @Mapping(target = "patientName", source = "patient", qualifiedByName = "patientFullName")
    @Mapping(target = "patientPhone", source = "patient.phoneNumber")
    @Mapping(target = "patientAge", source = "patient", qualifiedByName = "patientAge")
    @Mapping(target = "aiStatus", source = "visit", qualifiedByName = "aiStatus")
    @Mapping(target = "summaryRead", expression = "java(visit.getWhatsappStatus() == com.shifa.common.enums.WhatsAppStatus.READ)")
    @Mapping(target = "portalAccessValid", expression = "java(visit.isPortalAccessValid())")
    VisitListResponse toListResponse(Visit visit);

    List<VisitListResponse> toListResponseList(List<Visit> visits);

    @Named("aiStatus")
    default String aiStatus(Visit visit) {
        if (visit.getAiSummary() != null) return "COMPLETE";
        if (visit.getStatus() == VisitStatus.AI_PROCESSING) return "PENDING";
        return "NOT_STARTED";
    }

    @Named("portalUrl")
    default String portalUrl(Visit visit) {
        if (visit.getPatientPortalToken() == null) return null;
        return "https://shifa.health/visit/" + visit.getPatientPortalToken();
    }

    @Named("summaryMap")
    default Map<String, String> summaryMap(Visit visit) {
        if (visit.getPatientSummaries() == null) return Map.of();
        return visit.getPatientSummaries().entrySet().stream()
            .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().getSummaryText()));
    }

    @Named("patientFullName")
    default String patientFullName(Patient p) {
        if (p == null) return null;
        return p.getFirstName() + " " + p.getLastName();
    }

    @Named("patientAge")
    default int patientAge(Patient p) {
        if (p == null) return 0;
        return p.getAge();
    }
}
