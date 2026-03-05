package com.shifa.domain.vitals;

import com.shifa.domain.vitals.dto.VitalsRequest;
import com.shifa.domain.vitals.dto.VitalsResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/visits/{id}/vitals")
@RequiredArgsConstructor
@Tag(name = "Vitals")
@SecurityRequirement(name = "bearerAuth")
public class VitalsController {

    private final VitalsService vitalsService;

    @PostMapping
    public ResponseEntity<VitalsResponse> recordVitals(
        @PathVariable UUID id,
        @Valid @RequestBody VitalsRequest request) {
        return ResponseEntity.ok(vitalsService.recordVitals(id, request));
    }

    @GetMapping
    public ResponseEntity<VitalsResponse> getVitals(@PathVariable UUID id) {
        return ResponseEntity.ok(vitalsService.getVitals(id));
    }
}
