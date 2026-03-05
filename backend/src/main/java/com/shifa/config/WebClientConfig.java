package com.shifa.config;

import com.shifa.config.properties.ClaudeProperties;
import com.shifa.config.properties.WhatsAppProperties;
import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * WebClient beans for all outbound HTTP integrations.
 *
 * WHY WebClient over RestTemplate?
 *   • Non-blocking (Project Reactor): AI calls (~3–5 s) don't block HTTP threads
 *   • Proper reactive timeout operators (retry, fallback)
 *   • Spring Boot 3.x recommended approach
 *
 * Beans:
 *  claudeWebClient    → https://api.anthropic.com/v1     read timeout 30 s
 *  whatsappWebClient  → https://graph.facebook.com/v19.0 read timeout 10 s
 *
 * Timeouts are enforced at the Netty transport level — not just Spring-level —
 * so they truly cancel the underlying TCP connection if exceeded.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class WebClientConfig {

    private final ClaudeProperties claudeProperties;
    private final WhatsAppProperties whatsAppProperties;

    // ─────────────────────────────────────────────────────────────
    // Claude AI WebClient
    // ─────────────────────────────────────────────────────────────

    /**
     * Pre-configured WebClient for Anthropic's Claude API.
     *
     * Default headers on every request:
     *   x-api-key:          Claude API key (from env var / Secrets Manager)
     *   anthropic-version:  Pinned — prevents surprise breaking changes
     *   Content-Type:       application/json
     *
     * Buffer: 5 MB — AI responses for long doctor notes can be large.
     * Read timeout: 30 s — Claude can take up to 20 s for complex summaries.
     */
    @Bean(name = "claudeWebClient")
    public WebClient claudeWebClient() {
        return WebClient.builder()
            .baseUrl(claudeProperties.getBaseUrl())
            .clientConnector(new ReactorClientHttpConnector(
                buildHttpClient(5_000, 30, 30)))
            .defaultHeader("x-api-key", claudeProperties.getApiKey())
            .defaultHeader("anthropic-version", "2023-06-01")
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .codecs(c -> c.defaultCodecs().maxInMemorySize(5 * 1024 * 1024))
            .filter(logRequest("Claude"))
            .filter(logResponse("Claude"))
            .build();
    }

    // ─────────────────────────────────────────────────────────────
    // WhatsApp Cloud API WebClient
    // ─────────────────────────────────────────────────────────────

    /**
     * Pre-configured WebClient for Meta WhatsApp Cloud API.
     *
     * Default headers:
     *   Authorization:  Bearer {token}
     *   Content-Type:   application/json
     *
     * Base URL: https://graph.facebook.com/v19.0
     * Read timeout: 10 s — WhatsApp API is fast; 10 s is generous.
     */
    @Bean(name = "whatsappWebClient")
    public WebClient whatsappWebClient() {
        return WebClient.builder()
            .baseUrl(whatsAppProperties.getBaseUrl())
            .clientConnector(new ReactorClientHttpConnector(
                buildHttpClient(5_000, 10, 10)))
            .defaultHeader(HttpHeaders.AUTHORIZATION,
                "Bearer " + whatsAppProperties.getToken())
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .codecs(c -> c.defaultCodecs().maxInMemorySize(1024 * 1024))
            .filter(logRequest("WhatsApp"))
            .filter(logResponse("WhatsApp"))
            .build();
    }

    // ─────────────────────────────────────────────────────────────
    // Shared Netty HTTP client builder
    // ─────────────────────────────────────────────────────────────

    private HttpClient buildHttpClient(int connectMs, int readSec, int writeSec) {
        return HttpClient.create()
            .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, connectMs)
            .option(ChannelOption.SO_KEEPALIVE, true)
            .responseTimeout(Duration.ofSeconds(readSec))
            .doOnConnected(conn -> conn
                .addHandlerLast(new ReadTimeoutHandler(readSec, TimeUnit.SECONDS))
                .addHandlerLast(new WriteTimeoutHandler(writeSec, TimeUnit.SECONDS))
            );
    }

    // ─────────────────────────────────────────────────────────────
    // Debug logging filters (silent in production — DEBUG level)
    // ─────────────────────────────────────────────────────────────

    private ExchangeFilterFunction logRequest(String name) {
        return ExchangeFilterFunction.ofRequestProcessor(req -> {
            log.debug("[{}] → {} {}", name, req.method(), req.url());
            return Mono.just(req);
        });
    }

    private ExchangeFilterFunction logResponse(String name) {
        return ExchangeFilterFunction.ofResponseProcessor(res -> {
            log.debug("[{}] ← HTTP {}", name, res.statusCode());
            return Mono.just(res);
        });
    }
}
