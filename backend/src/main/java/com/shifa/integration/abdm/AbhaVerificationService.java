package com.shifa.integration.abdm;

import com.shifa.integration.abdm.config.AbdmProperties;
import com.shifa.integration.abdm.exception.AbdmIntegrationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class AbhaVerificationService {

    private final AbdmGatewayClient gatewayClient;
    private final AbdmProperties props;

    public AbhaVerificationResult verifyAbhaId(String abhaId) {
        if (!props.isEnabled()) return null;
        try {
            return gatewayClient.verifyAbhaId(abhaId);
        } catch (AbdmIntegrationException e) {
            log.warn("[ABDM] ABHA verification failed for {}. Proceeding without.", abhaId);
            return null;
        }
    }

    public record AbhaVerificationResult(
        String abhaId, String name, String yearOfBirth,
        String gender, boolean verified) {}
}
