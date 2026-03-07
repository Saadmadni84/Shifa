package com.shifa.domain.visit;

import com.shifa.common.enums.VisitStatus;
import com.shifa.common.pagination.PageResponse;
import com.shifa.domain.prescription.dto.MedicationResponse;
import com.shifa.domain.user.User;
import com.shifa.domain.user.UserRepository;
import com.shifa.domain.visit.dto.VisitCreateRequest;
import com.shifa.domain.visit.dto.VisitListResponse;
import com.shifa.domain.visit.dto.VisitMapper;
import com.shifa.domain.visit.dto.VisitNotesRequest;
import com.shifa.domain.visit.dto.VisitPatientResponse;
import com.shifa.domain.visit.dto.VisitResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service("domainVisitService")
@Transactional
@Slf4j
@RequiredArgsConstructor
public class VisitService {

    private final VisitRepository visitRepository;
    private final UserRepository userRepository;
    private final VisitMapper visitMapper;
    private final com.shifa.service.visit.VisitService appVisitService;
    private final com.shifa.service.visit.VisitQueryService visitQueryService;

    public VisitResponse createVisit(VisitCreateRequest request, String username) {
        UUID doctorUserId = resolveUserId(username);

        com.shifa.service.dto.VisitCreateRequest appRequest = new com.shifa.service.dto.VisitCreateRequest();
        appRequest.setPatientId(request.getPatientId());
        appRequest.setVisitDate(request.getVisitDate());
        appRequest.setChiefComplaint(request.getChiefComplaint());
        appRequest.setRawNotes(request.getRawNotes());

        Visit visit = appVisitService.createVisit(appRequest, doctorUserId);
        return visitMapper.toResponse(visit);
    }

    public VisitResponse submitNotes(UUID id, VisitNotesRequest request) {
        Visit existing = visitRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Visit not found"));
        UUID doctorUserId = existing.getDoctor().getUser().getId();

        com.shifa.service.dto.VisitUpdateRequest updateRequest = new com.shifa.service.dto.VisitUpdateRequest();
        updateRequest.setRawNotes(request.getRawNotes());
        updateRequest.setDiagnosis(request.getDiagnosis());
        updateRequest.setFollowUpDate(request.getFollowUpDate());
        Visit updated = appVisitService.updateVisit(id, updateRequest, doctorUserId);

        if (request.isForceReprocess()) {
            appVisitService.triggerAIProcessing(id, doctorUserId);
        }

        return visitMapper.toResponse(updated);
    }

    public void triggerAIProcessing(UUID id) {
        Visit existing = visitRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Visit not found"));
        UUID doctorUserId = existing.getDoctor().getUser().getId();
        appVisitService.triggerAIProcessing(id, doctorUserId);
    }

    public VisitResponse sendToPatient(UUID id, String username) {
        UUID doctorUserId = resolveUserId(username);
        Visit visit = appVisitService.sendToPatient(id, doctorUserId);
        return visitMapper.toResponse(visit);
    }

    public PageResponse<VisitListResponse> getVisits(String username, int page, int size, VisitStatus status) {
        UUID doctorUserId = resolveUserId(username);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Visit> visitsPage = visitQueryService.getVisitsByDoctor(doctorUserId, pageable);

        Page<Visit> filtered = visitsPage;
        if (status != null) {
            List<Visit> filteredContent = visitsPage.getContent().stream()
                .filter(v -> v.getStatus() == status)
                .collect(Collectors.toList());
            filtered = new PageImpl<>(filteredContent, pageable, filteredContent.size());
        }

        return PageResponse.of(filtered.map(visitMapper::toListResponse));
    }

    public VisitResponse getVisitById(UUID id) {
        Visit visit = visitRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Visit not found"));
        return visitMapper.toResponse(visit);
    }

    public VisitPatientResponse getPatientView(String token) {
        com.shifa.service.dto.PatientPortalDTO dto = visitQueryService.getVisitByPortalToken(token);
        var ai = dto.getAiSummary();

        List<MedicationResponse> medications = ai == null ? List.of() : ai.getMedications().stream()
            .map(m -> MedicationResponse.builder()
                .name(m.getName())
                .genericName(m.getGenericName())
                .dosage(m.getDosage())
                .frequency(m.getFrequency())
                .timing(m.getTiming())
                .durationDays(m.getDurationDays())
                .purpose(m.getPurpose())
                .sideEffectsToWatch(m.getSideEffectsToWatch())
                .critical(m.isCritical())
                .build())
            .collect(Collectors.toList());

        return VisitPatientResponse.builder()
            .visitId(dto.getVisitId() != null ? dto.getVisitId().toString() : null)
            .visitDate(dto.getVisitDate() != null ? LocalDate.parse(dto.getVisitDate()) : null)
            .doctorName(dto.getDoctorName())
            .doctorSpecialization(dto.getDoctorSpecialization())
            .clinicName(dto.getClinicName())
            .clinicPhone(dto.getClinicPhone())
            .patientFirstName(dto.getPatientFirstName())
            .preferredLanguage(dto.getPreferredLanguage())
            .summaryText(dto.getPatientFriendlyText())
            .diagnosis(ai != null ? ai.getDiagnosis() : null)
            .medications(medications)
            .dietaryAdvice(ai != null ? ai.getDietaryAdvice() : List.of())
            .activityRestrictions(ai != null ? ai.getActivityRestrictions() : List.of())
            .redFlags(ai != null ? ai.getRedFlags() : List.of())
            .testsOrdered(ai != null ? ai.getTestsOrdered() : List.of())
            .doctorInstructions(ai != null ? ai.getDoctorInstructions() : null)
            .followUpDate(dto.getFollowUpDate())
            .followUpInDays(ai != null ? ai.getFollowUpInDays() : null)
            .followUpNotes(ai != null ? ai.getFollowUpInstructions() : null)
            .chatEnabled(true)
            .portalAccessValid(dto.getTokenExpiresAt() == null || dto.getTokenExpiresAt().isAfter(java.time.LocalDateTime.now()))
            .build();
    }

    public String getSummaryText(String token, String lang) {
        com.shifa.service.dto.PatientPortalDTO dto = visitQueryService.getVisitByPortalTokenInLanguage(token, lang);
        return dto.getPatientFriendlyText();
    }

    private UUID resolveUserId(String username) {
        User user = userRepository.findByEmailOrPhoneNumber(username, username)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return user.getId();
    }
}
