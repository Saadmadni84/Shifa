package com.shifa.integration.whatsapp;

import com.shifa.integration.whatsapp.config.WhatsAppProperties;
import com.shifa.integration.whatsapp.exception.WhatsAppException;
import com.shifa.integration.whatsapp.exception.WhatsAppRateLimitException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class WhatsAppClient {

    private final WebClient webClient;
    private final WhatsAppProperties props;

    public WhatsAppClient(WhatsAppProperties props) {
        this.props = props;
        this.webClient = WebClient.builder()
            .baseUrl(props.getBaseUrl())
            .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + props.getToken())
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }

    public String sendTextMessage(String to, String body) {
        var payload = Map.of(
            "messaging_product", "whatsapp",
            "recipient_type", "individual",
            "to", normalizePhone(to),
            "type", "text",
            "text", Map.of("preview_url", false, "body", truncate(body))
        );
        return post(payload);
    }

    public String sendTemplateMessage(String to, String templateName,
                                       String languageCode, List<String> params) {
        var components = params.isEmpty() ? List.of() : List.of(
            Map.of("type", "body",
                   "parameters", params.stream()
                       .map(p -> Map.of("type", "text", "text", p)).toList())
        );
        var payload = Map.of(
            "messaging_product", "whatsapp",
            "to", normalizePhone(to),
            "type", "template",
            "template", Map.of(
                "name", templateName,
                "language", Map.of("code", languageCode),
                "components", components
            )
        );
        return post(payload);
    }

    public void markAsRead(String messageId) {
        post(Map.of("messaging_product", "whatsapp", "status", "read", "message_id", messageId));
    }

    @SuppressWarnings("unchecked")
    private String post(Object payload) {
        Map<?, ?> response = webClient.post()
            .uri("/{phoneNumberId}/messages", props.getPhoneNumberId())
            .bodyValue(payload)
            .retrieve()
            .onStatus(s -> s.value() == 400, res ->
                res.bodyToMono(String.class)
                    .flatMap(b -> Mono.error(new WhatsAppException("WhatsApp 400: " + b))))
            .onStatus(s -> s.value() == 401, res ->
                Mono.error(new WhatsAppException("WhatsApp auth failed — check token")))
            .onStatus(s -> s.value() == 429, res ->
                Mono.error(new WhatsAppRateLimitException("WhatsApp rate limit exceeded")))
            .onStatus(HttpStatusCode::is5xxServerError, res ->
                Mono.error(new WhatsAppException("WhatsApp 5xx — will retry")))
            .bodyToMono(Map.class)
            .timeout(Duration.ofSeconds(props.getTimeoutSeconds()))
            .retryWhen(
                Retry.backoff(props.getRetryMaxAttempts(), Duration.ofMillis(props.getRetryDelayMs()))
                    .filter(e -> e instanceof WhatsAppException
                              && !(e instanceof WhatsAppRateLimitException))
            )
            .block();

        if (response == null) return null;
        var messages = (List<Map<?, ?>>) response.get("messages");
        return (messages != null && !messages.isEmpty()) ? (String) messages.get(0).get("id") : null;
    }

    public String normalizePhone(String phone) {
        if (phone == null) return null;
        String c = phone.replaceAll("[\\s\\-()]+", "");
        if (c.startsWith("+")) c = c.substring(1);
        if (c.matches("^[6-9]\\d{9}$")) c = "91" + c;
        return c;
    }

    private String truncate(String text) {
        if (text == null) return null;
        return text.length() <= props.getMaxMessageLength()
            ? text
            : text.substring(0, props.getMaxMessageLength() - 3) + "...";
    }
}
