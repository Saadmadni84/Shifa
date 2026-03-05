package com.shifa.domain.consent.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ConsentResponse {

    String id;
    String patientId;
    String consentType;
    boolean optedIn;
    String source;
    String ipAddress;
    LocalDate validUntil;
    LocalDateTime recordedAt;
}
