package com.shifa.domain.patient;

import com.shifa.security.annotation.CurrentUser;
import com.shifa.security.dto.UserPrincipal;
import com.shifa.service.dto.PatientCreateRequest;
import com.shifa.service.dto.PatientSearchResult;
import com.shifa.service.patient.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    public Page<PatientSearchResult> search(
            @RequestParam(required = false) String query,
            @CurrentUser UserPrincipal principal,
            Pageable pageable) {
        return patientService.searchPatients(query, principal.getUserId(), pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Patient create(
            @RequestBody PatientCreateRequest request,
            @CurrentUser UserPrincipal principal) {
        return patientService.createPatient(request, principal.getUserId());
    }

    @GetMapping("/{id}")
    public Patient getById(@PathVariable UUID id) {
        return patientService.getPatient(id);
    }

    @PutMapping("/{id}")
    public Patient update(
            @PathVariable UUID id,
            @RequestBody PatientCreateRequest request) {
        return patientService.updatePatient(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        patientService.deletePatient(id);
    }
}
