package com.shifa.integration.sms;

import com.shifa.integration.sms.config.SmsProperties;
import com.shifa.integration.sms.exception.SmsDeliveryException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.MessageAttributeValue;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.SnsException;

import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class AwsSnsSmsClient {

    private final SnsClient snsClient;
    private final SmsProperties props;

    public void send(String to, String body) {
        String normalizedPhone = normalizeForSns(to);

        var request = PublishRequest.builder()
            .phoneNumber(normalizedPhone)
            .message(body)
            .messageAttributes(Map.of(
                "AWS.SNS.SMS.SMSType",
                MessageAttributeValue.builder()
                    .dataType("String")
                    .stringValue(props.getSmsType() != null ? props.getSmsType() : "Transactional")
                    .build(),
                "AWS.SNS.SMS.SenderID",
                MessageAttributeValue.builder()
                    .dataType("String")
                    .stringValue(props.getSenderId())
                    .build()
            ))
            .build();

        try {
            var response = snsClient.publish(request);
            log.info("[SNS] SMS sent. messageId={}", response.messageId());
        } catch (SnsException e) {
            throw new SmsDeliveryException("SNS delivery failed: " + e.getMessage(), e);
        }
    }

    private String normalizeForSns(String phone) {
        if (phone == null) return null;
        String c = phone.replaceAll("[\\s\\-()]+", "");
        if (c.matches("^[6-9]\\d{9}$")) return "+91" + c;
        if (!c.startsWith("+")) return "+" + c;
        return c;
    }
}
