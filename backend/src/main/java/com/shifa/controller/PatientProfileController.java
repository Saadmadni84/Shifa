package com.shifa.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shifa.domain.patient.PatientService;
import com.shifa.domain.patient.dto.PatientResponse;
import com.shifa.domain.patient.dto.PatientUpdateRequest;
import com.shifa.security.dto.UserPrincipal;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class PatientProfileController {

    private final PatientService patientService;

    @GetMapping({"/patient/profile", "/patients/me"})
    public ResponseEntity<PatientResponse> getProfile(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null || currentUser.getUserId() == null) {
            return ResponseEntity.status(401).build();
        }
        PatientResponse profile = patientService.getPatientProfileByUserId(currentUser.getUserId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping({"/patient/profile", "/patients/me"})
    public ResponseEntity<PatientResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody PatientUpdateRequest request) {
        if (currentUser == null || currentUser.getUserId() == null) {
            return ResponseEntity.status(401).build();
        }
        PatientResponse updated = patientService.updatePatientProfileByUserId(currentUser.getUserId(), request);
        return ResponseEntity.ok(updated);
    }
}
