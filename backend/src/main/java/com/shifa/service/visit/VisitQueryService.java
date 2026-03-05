package com.shifa.service.visit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shifa.security.annotation.PhiAccess;
import com.shifa.service.dto.PatientPortalDTO;
import com.shifa.service.dto.VisitSummaryData;
import com.shifa.service.exception.PortalTokenExpiredException;
import com.shifa.service.exception.VisitNotFoundException;
import com.shifa.service.language.LanguageService;
import com.shifa.domain.visit.Visit;
import com.shifa.domain.visit.VisitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class VisitQueryService {

    private final VisitRepository visitRepository;
    private final LanguageService languageService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    @PhiAccess(action = "VIEW_VISIT", resource = "VISIT")
    public Visit getVisitForDoctor(UUID visitId, UUID doctorId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new VisitNotFoundException(visitId));

        if (!visit.getDoctor().getUser().getId().equals(doctorId)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }

        return visit;
    }

    @Transactional(readOnly = true)
    public Page<Visit> getVisitsByDoctor(UUID doctorId, Pageable pageable) {
        return visitRepository.findByDoctorUserIdAndDeletedFalse(doctorId, pageable);
    }

    @Transactional(readOnly = true)
    @PhiAccess(action = "VIEW_PATIENT_VISITS", resource = "VISIT")
    public Page<Visit> getVisitsByPatient(Long patientId, UUID doctorId, Pageable pageable) {
        return visitRepository.findByPatientIdAndDoctorUserIdAndDeletedFalse(
                patientId, doctorId, pageable);
    }

    @Transactional(readOnly = true)
    public AIStatusResponse getAIStatus(UUID visitId) {
        return visitRepository.findAIStatusById(visitId)
                .orElseThrow(() -> new VisitNotFoundException(visitId));
    }

    @Cacheable(value = "visit-portal", key = "#token")
    @Transactional(readOnly = true)
    public PatientPortalDTO getVisitByPortalToken(String token) {
        Visit visit = visitRepository.findByPatientPortalToken(token)
                .orElseThrow(() -> new VisitNotFoundException("Invalid portal link"));

        if (visit.getPortalTokenExpiresAt() != null &&
                visit.getPortalTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new PortalTokenExpiredException(
                    "This visit summary link has expired. Please ask your doctor for a new link.");
        }

        VisitSummaryData summary = parseAiSummary(visit.getAiSummaryJson());

        return PatientPortalDTO.builder()
                .visitId(visit.getId())
                .visitDate(visit.getVisitDate().toString())
                .doctorName(
                        visit.getDoctor().getUser().getFirstName() + " " + visit.getDoctor().getUser().getLastName())
                .doctorSpecialization(visit.getDoctor().getSpecialization())
                .clinicName(visit.getDoctor().getClinicName())
                .clinicPhone(visit.getDoctor().getClinicPhone())
                .patientFirstName(visit.getPatient().getFirstName())
                .preferredLanguage(visit.getPatient().getPreferredLanguage())
                .aiSummary(summary)
                .patientFriendlyText(summary != null ? summary.getPatientFriendlyText() : null)
                .followUpDate(visit.getFollowUpDate())
                .tokenExpiresAt(visit.getPortalTokenExpiresAt())
                .whatsappStatus(visit.getWhatsappDeliveryStatus())
                .build();
    }

    @Transactional(readOnly = true)
    public PatientPortalDTO getVisitByPortalTokenInLanguage(String token, String languageCode) {
        PatientPortalDTO base = getVisitByPortalToken(token);

        if (languageCode.equals(base.getPreferredLanguage())) {
            return base;
        }

        if (base.getAiSummary() != null) {
            String translated = languageService.translateSummary(
                    base.getAiSummary(), languageCode);
            return PatientPortalDTO.builder()
                    .visitId(base.getVisitId())
                    .visitDate(base.getVisitDate())
                    .doctorName(base.getDoctorName())
                    .doctorSpecialization(base.getDoctorSpecialization())
                    .clinicName(base.getClinicName())
                    .clinicPhone(base.getClinicPhone())
                    .patientFirstName(base.getPatientFirstName())
                    .preferredLanguage(languageCode)
                    .aiSummary(base.getAiSummary())
                    .patientFriendlyText(translated)
                    .followUpDate(base.getFollowUpDate())
                    .tokenExpiresAt(base.getTokenExpiresAt())
                    .whatsappStatus(base.getWhatsappStatus())
                    .build();
        }

        return base;
    }

    private VisitSummaryData parseAiSummary(String json) {
        if (json == null)
            return null;
        try {
            return objectMapper.readValue(json, VisitSummaryData.class);
        } catch (Exception e) {
            log.error("[VisitQueryService] Failed to parse AI summary JSON", e);
            return null;
        }
    }

    public record AIStatusResponse(
            UUID visitId,
            String status,
            String aiSummaryJson,
            String aiErrorMessage) {
    }
}
