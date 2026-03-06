package com.shifa.domain.consent;

import com.shifa.domain.consent.dto.ConsentRequest;
import com.shifa.domain.consent.dto.ConsentResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class ConsentService {

    private final ConsentRepository consentRepository;

    public ConsentResponse grantConsent(ConsentRequest request, String ipAddress, String userAgent) {
        return null; // TODO implement
    }

    public ConsentResponse revokeConsent(ConsentRequest request, String ipAddress, String userAgent) {
        return null; // TODO implement
    }
}
