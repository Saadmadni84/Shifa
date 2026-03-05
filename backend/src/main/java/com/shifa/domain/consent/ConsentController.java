package com.shifa.domain.consent;

import com.shifa.domain.consent.dto.ConsentRequest;
import com.shifa.domain.consent.dto.ConsentResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/consent")
@RequiredArgsConstructor
@Tag(name = "Consent")
public class ConsentController {

    private final ConsentService consentService;

    @PostMapping("/grant")
    public ResponseEntity<ConsentResponse> grantConsent(
        @Valid @RequestBody ConsentRequest request,
        HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader("User-Agent");
        return ResponseEntity.ok(consentService.grantConsent(request, ip, userAgent));
    }

    @PostMapping("/revoke")
    public ResponseEntity<ConsentResponse> revokeConsent(
        @Valid @RequestBody ConsentRequest request,
        HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader("User-Agent");
        return ResponseEntity.ok(consentService.revokeConsent(request, ip, userAgent));
    }
}
