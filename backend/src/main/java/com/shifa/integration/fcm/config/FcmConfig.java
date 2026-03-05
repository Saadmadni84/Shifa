package com.shifa.integration.fcm.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.shifa.integration.fcm.config.FcmProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
@RequiredArgsConstructor
public class FcmConfig {

    private final FcmProperties props;

    @Bean
    @ConditionalOnProperty(name = "integration.fcm.enabled", havingValue = "true")
    public FirebaseApp firebaseApp() throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) return FirebaseApp.getInstance();

        InputStream sa = props.getServiceAccountJson() != null
            ? new ByteArrayInputStream(props.getServiceAccountJson().getBytes(StandardCharsets.UTF_8))
            : getClass().getResourceAsStream("/firebase-service-account.json");

        if (sa == null) {
            throw new IOException("Firebase service account JSON not found");
        }

        FirebaseOptions opts = FirebaseOptions.builder()
            .setCredentials(GoogleCredentials.fromStream(sa))
            .setProjectId(props.getProjectId())
            .build();

        return FirebaseApp.initializeApp(opts);
    }
}
