package com.shifa.integration.abdm;

import com.shifa.integration.abdm.config.AbdmProperties;
import com.shifa.integration.abdm.exception.AbdmIntegrationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class AbdmTokenManager {

    private final WebClient.Builder webClientBuilder;
    private final AbdmProperties props;
    private final RedisTemplate<String, String> redis;

    private static final String TOKEN_KEY = "abdm:access_token";

    public String getAccessToken() {
        String cached = redis.opsForValue().get(TOKEN_KEY);
        if (cached != null) return cached;
        return refreshToken();
    }

    private synchronized String refreshToken() {
        String cached = redis.opsForValue().get(TOKEN_KEY);
        if (cached != null) return cached;

        log.info("[ABDM] Refreshing access token");
        Map<?, ?> resp = webClientBuilder.build().post()
            .uri(props.getBaseUrl() + "/v0.5/sessions")
            .bodyValue(Map.of("clientId", props.getClientId(),
                              "clientSecret", props.getClientSecret()))
            .retrieve()
            .bodyToMono(Map.class)
            .block();

        if (resp == null || !resp.containsKey("accessToken"))
            throw new AbdmIntegrationException("ABDM token refresh failed");

        String token = (String) resp.get("accessToken");
        Object expiresObj = resp.get("expiresIn");
        int expiry = (expiresObj instanceof Number) ? ((Number) expiresObj).intValue() : 1800;
        redis.opsForValue().set(TOKEN_KEY, token,
            Duration.ofSeconds(expiry - props.getTokenRefreshBufferSeconds()));

        log.info("[ABDM] Token refreshed. expiresIn={}s", expiry);
        return token;
    }
}
