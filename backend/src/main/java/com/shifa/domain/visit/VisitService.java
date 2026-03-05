package com.shifa.domain.visit;

import com.shifa.common.enums.VisitStatus;
import com.shifa.common.pagination.PageResponse;
import com.shifa.domain.visit.dto.VisitCreateRequest;
import com.shifa.domain.visit.dto.VisitListResponse;
import com.shifa.domain.visit.dto.VisitNotesRequest;
import com.shifa.domain.visit.dto.VisitPatientResponse;
import com.shifa.domain.visit.dto.VisitResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class VisitService {

    private final VisitRepository visitRepository;

    public VisitResponse createVisit(VisitCreateRequest request, String username) {
        return null; // TODO implement
    }

    public VisitResponse submitNotes(UUID id, VisitNotesRequest request) {
        return null; // TODO implement
    }

    public void triggerAIProcessing(UUID id) {
        // TODO implement
    }

    public VisitResponse sendToPatient(UUID id, String username) {
        return null; // TODO implement
    }

    public PageResponse<VisitListResponse> getVisits(String username, int page, int size, VisitStatus status) {
        return null; // TODO implement
    }

    public VisitResponse getVisitById(UUID id) {
        return null; // TODO implement
    }

    public VisitPatientResponse getPatientView(String token) {
        return null; // TODO implement
    }

    public String getSummaryText(String token, String lang) {
        return null; // TODO implement
    }
}
