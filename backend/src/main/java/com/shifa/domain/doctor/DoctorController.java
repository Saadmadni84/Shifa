package com.shifa.domain.doctor;

import com.shifa.common.pagination.PageResponse;
import com.shifa.domain.doctor.dto.DoctorProfileRequest;
import com.shifa.domain.doctor.dto.DoctorProfileResponse;
import com.shifa.domain.doctor.dto.DoctorStatsResponse;
import com.shifa.domain.patient.dto.PatientSummaryResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctor")
@SecurityRequirement(name = "bearerAuth")
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorProfileResponse> getMyProfile(
        @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(doctorService.getProfile(userDetails.getUsername()));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorProfileResponse> updateProfile(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody DoctorProfileRequest request) {
        return ResponseEntity.ok(doctorService.updateProfile(userDetails.getUsername(), request));
    }

    @GetMapping("/me/stats")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorStatsResponse> getStats(
        @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(doctorService.getStats(userDetails.getUsername()));
    }

    @GetMapping("/me/patients")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PageResponse<PatientSummaryResponse>> getMyPatients(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String search) {
        return ResponseEntity.ok(
            doctorService.getPatients(userDetails.getUsername(), page, size, search));
    }
}
