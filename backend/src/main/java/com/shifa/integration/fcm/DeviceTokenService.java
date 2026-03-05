package com.shifa.integration.fcm;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeviceTokenService {

    public List<String> getActiveTokens(UUID userId) {
        // Implementation to fetch active FCM tokens for the user from DB
        return List.of();
    }

    public void deactivateToken(String token) {
        // Implementation to remove/mark inactive the FCM token in DB
    }
}
