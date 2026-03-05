package com.shifa.integration.email;

import com.shifa.integration.email.config.SesProperties;
import com.shifa.integration.email.exception.EmailDeliveryException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.sesv2.SesV2Client;
import software.amazon.awssdk.services.sesv2.model.*;

@Component
@Slf4j
@RequiredArgsConstructor
public class SesEmailClient {

    private final SesV2Client sesClient;
    private final SesProperties props;

    public void sendHtml(String to, String subject, String htmlBody) {
        try {
            var resp = sesClient.sendEmail(SendEmailRequest.builder()
                .fromEmailAddress(props.getFromAddress())
                .destination(Destination.builder().toAddresses(to).build())
                .content(EmailContent.builder()
                    .simple(Message.builder()
                        .subject(Content.builder().data(subject).charset("UTF-8").build())
                        .body(Body.builder()
                            .html(Content.builder().data(htmlBody).charset("UTF-8").build())
                            .build())
                        .build())
                    .build())
                .configurationSetName(props.getConfigurationSet())
                .build());

            log.info("[SES] Sent. messageId={}, to={}", resp.messageId(), to);
        } catch (SesV2Exception e) {
            log.error("[SES] Failed to {} : {}", to, e.getMessage());
            throw new EmailDeliveryException("SES send failed", e);
        }
    }
}
