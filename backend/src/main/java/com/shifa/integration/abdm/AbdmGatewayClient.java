package com.shifa.integration.abdm;

import com.shifa.integration.abdm.exception.AbdmIntegrationException;
import org.springframework.stereotype.Component;

@Component
public class AbdmGatewayClient {

    public AbhaVerificationService.AbhaVerificationResult verifyAbhaId(String abhaId) {
        // Mock implementation for ABDM gateway verification call
        if (abhaId == null || abhaId.isBlank()) {
            throw new AbdmIntegrationException("Invalid ABHA ID");
        }
        return new AbhaVerificationService.AbhaVerificationResult(abhaId, "Verified User", "1990", "M", true);
    }
}
