package com.shifa.integration.sms;

import com.shifa.common.enums.Language;
import com.shifa.integration.sms.config.SmsProperties;
import com.shifa.integration.sms.exception.SmsDeliveryException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
@RequiredArgsConstructor
public class SmsService {

    private final TwilioSmsClient twilioClient;
    private final AwsSnsSmsClient snsClient;
    private final SmsProperties props;

    public void sendOtp(String phone, String otp, Language lang) {
        sendWithFallback(phone,
            "Your Shifa OTP is " + otp + ". Valid 5 min. Do not share. -SHIFA",
            "OTP");
    }

    public void sendMedicationReminder(String phone, String medName,
                                        String timing, Language lang) {
        sendWithFallback(phone,
            "Shifa: Time for " + medName + " (" + timing + "). Stay healthy! -SHIFA",
            "MEDICATION");
    }

    public void sendFollowUpReminder(String phone, LocalDate date,
                                      String doctorName, Language lang) {
        sendWithFallback(phone,
            "Reminder: Follow-up with " + doctorName + " on " +
            date.format(DateTimeFormatter.ofPattern("dd MMM yyyy")) + ". -SHIFA",
            "FOLLOW_UP");
    }

    private void sendWithFallback(String phone, String message, String type) {
        try {
            dispatch(props.getProvider(), phone, message);
            log.info("[SMS] Sent via {}. phone={}, type={}", props.getProvider(), phone, type);
        } catch (SmsDeliveryException e) {
            log.warn("[SMS] Primary failed. Trying fallback. phone={}", phone);
            try {
                dispatch(props.getFallbackProvider(), phone, message);
                log.info("[SMS] Fallback succeeded. phone={}", phone);
            } catch (Exception ex) {
                log.error("[SMS] Both providers failed. phone={}", phone, ex);
                throw new SmsDeliveryException("SMS failed after fallback: " + phone, ex);
            }
        }
    }

    private void dispatch(String provider, String phone, String message) {
        if ("twilio".equalsIgnoreCase(provider)) twilioClient.send(phone, message);
        else snsClient.send(phone, message);
    }
}
