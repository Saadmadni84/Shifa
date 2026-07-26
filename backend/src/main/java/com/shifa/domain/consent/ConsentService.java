package com.shifa.domain.consent;

import com.shifa.domain.consent.dto.ConsentRequest;
import com.shifa.domain.consent.dto.ConsentResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ConsentService {

    public ConsentResponse grantConsent(ConsentRequest request, String ipAddress, String userAgent) {
        return null; // TODO implement
    }

    public ConsentResponse revokeConsent(ConsentRequest request, String ipAddress, String userAgent) {
        return null; // TODO implement
    }
}
