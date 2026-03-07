package com.shifa.service.visit;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shifa.common.enums.VisitStatus;
import com.shifa.domain.doctor.Doctor;
import com.shifa.domain.doctor.DoctorRepository;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.patient.PatientRepository;
import com.shifa.domain.visit.Visit;
import com.shifa.domain.visit.VisitRepository;
import com.shifa.integration.whatsapp.WhatsAppService;
import com.shifa.security.annotation.PhiAccess;
import com.shifa.service.ai.AIService;
import com.shifa.service.dto.VisitCreateRequest;
import com.shifa.service.dto.VisitSummaryData;
import com.shifa.service.dto.VisitUpdateRequest;
import com.shifa.service.event.VisitProcessedEvent;
import com.shifa.service.event.VisitSentEvent;
import com.shifa.service.exception.InvalidVisitStateException;
import com.shifa.service.exception.VisitNotFoundException;
import com.shifa.service.language.LanguageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service("appVisitService")
@RequiredArgsConstructor
@Slf4j
public class VisitService {

    private final VisitRepository visitRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AIService aiService;
    private final LanguageService languageService;
    private final WhatsAppService whatsAppService;
    private final ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Transactional
    @PhiAccess(action = "CREATE_VISIT", resource = "VISIT")
    public Visit createVisit(VisitCreateRequest request, UUID doctorId) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new com.shifa.service.exception.PatientNotFoundException(request.getPatientId()));

        Doctor doctor = doctorRepository.findByUserId(doctorId)
                .orElseThrow(() -> new IllegalStateException("Doctor profile not found"));

        Visit visit = new Visit();
        visit.setPatient(patient);
        visit.setDoctor(doctor);
        visit.setVisitDate(request.getVisitDate() != null ? request.getVisitDate() : java.time.LocalDate.now());
        visit.setChiefComplaint(request.getChiefComplaint());
        visit.setRawNotes(request.getRawNotes());
        visit.setStatus(VisitStatus.DRAFT);
        visit.setCreatedAt(LocalDateTime.now());

        Visit saved = visitRepository.save(visit);
        log.info("[VisitService] Visit created: visitId={} patientId={} doctorId={}",
                saved.getId(), patient.getId(), doctorId);

        if (request.getRawNotes() != null && !request.getRawNotes().isBlank()) {
            VisitStatusMachine.transition(VisitStatus.DRAFT, VisitStatus.NOTES_TAKEN);
            saved.setStatus(VisitStatus.NOTES_TAKEN);
            saved = visitRepository.save(saved);
            triggerAIProcessingAsync(saved.getId());
        }

        return saved;
    }

    @Transactional
    @PhiAccess(action = "UPDATE_VISIT", resource = "VISIT")
    public Visit updateVisit(UUID visitId, VisitUpdateRequest request, UUID doctorId) {
        Visit visit = findAndVerifyOwnership(visitId, doctorId);

        if (request.getRawNotes() != null)
            visit.setRawNotes(request.getRawNotes());
        if (request.getChiefComplaint() != null)
            visit.setChiefComplaint(request.getChiefComplaint());
        if (request.getDiagnosis() != null)
            visit.setDiagnosis(request.getDiagnosis());
        if (request.getFollowUpDate() != null)
            visit.setFollowUpDate(request.getFollowUpDate());

        visit.setUpdatedAt(LocalDateTime.now());
        Visit saved = visitRepository.save(visit);
        log.info("[VisitService] Visit updated: visitId={}", visitId);
        return saved;
    }

    @Transactional
    public Visit triggerAIProcessing(UUID visitId, UUID doctorId) {
        Visit visit = findAndVerifyOwnership(visitId, doctorId);

        if (!VisitStatusMachine.canTriggerAI(visit.getStatus())) {
            throw new InvalidVisitStateException(
                    "Cannot trigger AI for visit in status: " + visit.getStatus());
        }

        VisitStatusMachine.transition(visit.getStatus(), VisitStatus.AI_PROCESSING);
        visit.setStatus(VisitStatus.AI_PROCESSING);
        visitRepository.save(visit);

        triggerAIProcessingAsync(visitId);
        return visit;
    }

    @Async("aiProcessingExecutor")
    protected void triggerAIProcessingAsync(UUID visitId) {
        log.info("[VisitService] Starting async AI processing: visitId={}", visitId);

        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new VisitNotFoundException(visitId));

        try {
            VisitSummaryData summary = aiService.generateVisitSummary(visit);

            String patientLang = visit.getPatient().getPreferredLanguage().getCode();
            String patientText = aiService.generatePatientFriendlyText(summary, patientLang);
            summary.setPatientFriendlyText(patientText);

            String summaryJson = objectMapper.writeValueAsString(summary);
            visit.setAiSummaryJson(summaryJson);

            visit.setPatientPortalToken(UUID.randomUUID().toString().replace("-", ""));
            visit.setPortalTokenExpiresAt(LocalDateTime.now().plusDays(30));

            VisitStatusMachine.transition(VisitStatus.AI_PROCESSING, VisitStatus.REVIEWED);
            visit.setStatus(VisitStatus.REVIEWED);
            visit.setAiProcessedAt(LocalDateTime.now());
            visitRepository.save(visit);

            eventPublisher.publishEvent(new VisitProcessedEvent(this, visit));
            log.info("[VisitService] AI processing complete: visitId={}", visitId);

        } catch (Exception e) {
            log.error("[VisitService] AI processing failed: visitId={}", visitId, e);
            VisitStatusMachine.transition(VisitStatus.AI_PROCESSING, VisitStatus.NOTES_TAKEN);
            visit.setStatus(VisitStatus.NOTES_TAKEN);
            visit.setAiErrorMessage(e.getMessage());
            visitRepository.save(visit);
        }
    }

    @Transactional
    @PhiAccess(action = "SEND_VISIT_SUMMARY", resource = "VISIT")
    public Visit sendToPatient(UUID visitId, UUID doctorId) {
        Visit visit = findAndVerifyOwnership(visitId, doctorId);

        if (!VisitStatusMachine.canSendToPatient(visit.getStatus())) {
            throw new InvalidVisitStateException(
                    "Visit must be REVIEWED before sending. Current status: " + visit.getStatus());
        }
        if (visit.getAiSummaryJson() == null) {
            throw new InvalidVisitStateException("Visit has no AI summary. Please trigger AI processing first.");
        }
        if (visit.getPatient().getPhoneNumber() == null) {
            throw new InvalidVisitStateException("Patient has no phone number registered for WhatsApp.");
        }

        String metaMessageId = whatsAppService.sendVisitSummary(visit);

        VisitStatusMachine.transition(visit.getStatus(), VisitStatus.SENT_TO_PATIENT);
        visit.setStatus(VisitStatus.SENT_TO_PATIENT);
        visit.setWhatsappSentAt(LocalDateTime.now());
        visit.setWhatsappMetaMessageId(metaMessageId);

        Visit saved = visitRepository.save(visit);

        eventPublisher.publishEvent(new VisitSentEvent(this, saved));
        log.info("[VisitService] Visit sent to patient: visitId={} phone={}",
                visitId, maskPhone(visit.getPatient().getPhoneNumber()));

        return saved;
    }

    @Transactional
    public void deleteVisit(UUID visitId, UUID doctorId) {
        Visit visit = findAndVerifyOwnership(visitId, doctorId);
        visit.setDeleted(true);
        visit.setDeletedAt(LocalDateTime.now());
        visitRepository.save(visit);
        log.info("[VisitService] Visit soft-deleted: visitId={}", visitId);
    }

    private Visit findAndVerifyOwnership(UUID visitId, UUID doctorId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new VisitNotFoundException(visitId));

        if (!visit.getDoctor().getUser().getId().equals(doctorId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You do not have access to this visit");
        }

        if (visit.isDeleted()) {
            throw new VisitNotFoundException(visitId);
        }

        return visit;
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 5)
            return "****";
        return phone.substring(0, 5) + "*****";
    }
}
