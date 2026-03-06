package com.shifa.domain.consent.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class ConsentRequest {

    @NotNull(message = "Consent type is required")
    @Pattern(regexp = "DATA_PROCESSING|WHATSAPP_COMMUNICATION|AI_ANALYSIS|MARKETING",
             message = "Invalid consent type")
    private String consentType;

    @NotNull(message = "Opt-in status is required")
    private Boolean optedIn;

    private String source = "PORTAL";
    private String ipAddress;
    private LocalDate validUntil;
}
