package com.shifa.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

/**
 * Spring Web MVC configuration for Shifa.
 *
 * Responsibilities:
 *  1. CORS policy        — restrict cross-origin access to known frontend origins
 *  2. Jackson            — Java 8 date/time, IST timezone, API-safe defaults
 *  3. LocaleResolver     — resolve patient language from Accept-Language header
 *
 * CORS origins are injected from application.yml so switching environments
 * requires only config changes, not code changes:
 *   dev:  localhost:5173 (Vite), localhost:3000
 *   prod: https://shifa.health, https://app.shifa.health
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${shifa.cors.allowed-origins}")
    private List<String> allowedOrigins;

    // ─────────────────────────────────────────────────────────────
    // CORS
    // ─────────────────────────────────────────────────────────────

    /**
     * CORS bean — consumed by BOTH Spring MVC and Spring Security.
     *
     * The bean name "corsConfigurationSource" is picked up automatically
     * by SecurityConfig's .cors(cors -> cors.configurationSource(...)).
     *
     * allowCredentials(true) — required so Authorization header is forwarded
     * in cross-origin requests from the React frontend.
     *
     * maxAge(3600) — browser caches preflight results for 1 hour,
     * eliminating OPTIONS round-trips on every API call.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(
            List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of(
            "Authorization", "Content-Type", "Accept",
            "Accept-Language", "X-Requested-With"));
        config.setExposedHeaders(List.of(
            "X-Trace-Id",   // error correlation — frontend shows this in error dialogs
            "Retry-After"   // rate-limit — client knows when to retry
        ));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    // ─────────────────────────────────────────────────────────────
    // Jackson ObjectMapper
    // ─────────────────────────────────────────────────────────────

    /**
     * Primary Jackson ObjectMapper with Shifa-specific settings.
     *
     * Key decisions:
     *   JavaTimeModule                   → LocalDate/LocalDateTime/Instant support
     *   WRITE_DATES_AS_TIMESTAMPS=false  → ISO 8601 strings, not epoch millis
     *   FAIL_ON_UNKNOWN_PROPERTIES=false → clients survive API evolution
     *   READ_UNKNOWN_ENUM_VALUES_AS_NULL → clients survive new enum values
     *   Asia/Kolkata timezone            → all date display in IST
     *                                      (India doesn't observe DST — safe constant)
     *
     * @Primary → this bean is auto-wired everywhere ObjectMapper is needed:
     *   GlobalExceptionHandler, ShifaAuthEntryPoint, RedisConfig, etc.
     */
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        return Jackson2ObjectMapperBuilder.json()
            .modules(new JavaTimeModule())
            .featuresToDisable(
                SerializationFeature.WRITE_DATES_AS_TIMESTAMPS,
                SerializationFeature.WRITE_DURATIONS_AS_TIMESTAMPS,
                SerializationFeature.FAIL_ON_EMPTY_BEANS,
                DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES,
                DeserializationFeature.ADJUST_DATES_TO_CONTEXT_TIME_ZONE
            )
            .featuresToEnable(
                DeserializationFeature.READ_UNKNOWN_ENUM_VALUES_AS_NULL
            )
            .timeZone(TimeZone.getTimeZone("Asia/Kolkata"))
            .build();
    }

    // ─────────────────────────────────────────────────────────────
    // Locale Resolver
    // ─────────────────────────────────────────────────────────────

    /**
     * Resolves locale from the Accept-Language HTTP header.
     *
     * Doctors: browser language (usually English).
     * Patients: phone system language — Hindi, Tamil, Telugu, etc.
     *
     * Drives Spring MessageSource for static UI translations.
     * Dynamic AI translation of medical summaries is handled separately
     * in AIPromptService using Claude.
     *
     * Unsupported languages fall back to English.
     */
    @Bean
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
        resolver.setDefaultLocale(Locale.ENGLISH);
        resolver.setSupportedLocales(List.of(
            Locale.ENGLISH,                   // en
            Locale.forLanguageTag("hi"),      // Hindi
            Locale.forLanguageTag("ta"),      // Tamil
            Locale.forLanguageTag("te"),      // Telugu
            Locale.forLanguageTag("bn"),      // Bengali
            Locale.forLanguageTag("mr"),      // Marathi
            Locale.forLanguageTag("gu"),      // Gujarati
            Locale.forLanguageTag("kn"),      // Kannada
            Locale.forLanguageTag("ml"),      // Malayalam
            Locale.forLanguageTag("pa"),      // Punjabi
            Locale.forLanguageTag("ur"),      // Urdu
            Locale.forLanguageTag("or")       // Odia
        ));
        return resolver;
    }
}
