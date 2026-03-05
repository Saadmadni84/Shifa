package com.shifa.integration.fcm;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.*;
import com.shifa.common.enums.Language;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(name = "integration.fcm.enabled", havingValue = "true")
public class PushNotificationService {

    private final FirebaseApp firebaseApp;
    private final DeviceTokenService tokenService;

    @Async("notificationTaskExecutor")
    public void sendVisitReady(UUID patientId, String visitId, String name, Language lang) {
        tokenService.getActiveTokens(patientId).forEach(token ->
            sendToDevice(token,
                buildTitle(lang),
                buildBody(name, lang),
                Map.of("type", "VISIT_READY", "visitId", visitId))
        );
    }

    private void sendToDevice(String token, String title, String body, Map<String, String> data) {
        try {
            Message msg = Message.builder()
                .setToken(token)
                .setNotification(Notification.builder().setTitle(title).setBody(body).build())
                .putAllData(data)
                .setAndroidConfig(AndroidConfig.builder()
                    .setPriority(AndroidConfig.Priority.HIGH).build())
                .build();

            String id = FirebaseMessaging.getInstance(firebaseApp).send(msg);
            log.info("[FCM] Sent. messageId={}", id);

        } catch (FirebaseMessagingException e) {
            if (e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) {
                tokenService.deactivateToken(token);
            }
            log.warn("[FCM] Push failed: {}", e.getMessage());
        }
    }

    private String buildTitle(Language lang) {
        return switch (lang) {
            case HI -> "Shifa — आपकी रिपोर्ट तैयार है 🩺";
            case TA -> "Shifa — உங்கள் அறிக்கை தயார் 🩺";
            default  -> "Shifa — Your visit summary is ready 🩺";
        };
    }

    private String buildBody(String name, Language lang) {
        return switch (lang) {
            case HI -> name + " जी, डॉक्टर की सलाह देखने के लिए tap करें";
            case TA -> name + ", மருத்துவரின் ஆலோசனை காண tap செய்யவும்";
            default  -> "Tap to view your doctor's advice, " + name;
        };
    }
}
