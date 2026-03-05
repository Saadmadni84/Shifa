package com.shifa.domain.visit;

import com.shifa.common.enums.VisitStatus;
import com.shifa.common.pagination.PageResponse;
import com.shifa.common.web.ApiResponse;
import com.shifa.domain.visit.dto.VisitCreateRequest;
import com.shifa.domain.visit.dto.VisitListResponse;
import com.shifa.domain.visit.dto.VisitNotesRequest;
import com.shifa.domain.visit.dto.VisitPatientResponse;
import com.shifa.domain.visit.dto.VisitResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Visit")
@SecurityRequirement(name = "bearerAuth")
public class VisitController {

    private final VisitService visitService;

    @PostMapping("/api/visits")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<VisitResponse> createVisit(
        @Valid @RequestBody VisitCreateRequest request,
        @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(visitService.createVisit(request, userDetails.getUsername()));
    }

    @PutMapping("/api/visits/{id}/notes")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<VisitResponse> submitNotes(
        @PathVariable UUID id,
        @Valid @RequestBody VisitNotesRequest request) {
        return ResponseEntity.ok(visitService.submitNotes(id, request));
    }

    @PostMapping("/api/visits/{id}/process")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<String>> processWithAI(@PathVariable UUID id) {
        visitService.triggerAIProcessing(id);
        return ResponseEntity.accepted()
            .body(ApiResponse.of("AI processing started. This takes 15-30 seconds."));
    }

    @PostMapping("/api/visits/{id}/send")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<VisitResponse> sendToPatient(@PathVariable UUID id,
        @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(visitService.sendToPatient(id, userDetails.getUsername()));
    }

    @GetMapping("/api/visits")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PageResponse<VisitListResponse>> getVisits(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) VisitStatus status) {
        return ResponseEntity.ok(visitService.getVisits(userDetails.getUsername(), page, size, status));
    }

    @GetMapping("/api/visits/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<VisitResponse> getVisit(@PathVariable UUID id) {
        return ResponseEntity.ok(visitService.getVisitById(id));
    }

    @GetMapping("/api/portal/{token}")
    public ResponseEntity<VisitPatientResponse> getPatientView(@PathVariable String token) {
        return ResponseEntity.ok(visitService.getPatientView(token));
    }

    @GetMapping("/api/portal/{token}/summary")
    public ResponseEntity<String> getSummaryText(
        @PathVariable String token,
        @RequestParam(defaultValue = "en") String lang) {
        return ResponseEntity.ok(visitService.getSummaryText(token, lang));
    }
}
