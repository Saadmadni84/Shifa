package com.shifa.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI 3 / Swagger UI configuration for Shifa.
 *
 * Swagger UI:   http://localhost:8080/swagger-ui/index.html
 * OpenAPI JSON: http://localhost:8080/v3/api-docs
 *
 * JWT usage in Swagger UI:
 *   1. Call POST /api/v1/auth/login → copy accessToken
 *   2. Click "Authorize" → paste token (without "Bearer " prefix)
 *   3. All subsequent Swagger requests include Authorization: Bearer {token}
 *
 * Production: disabled via application-prod.yml
 *   springdoc.api-docs.enabled=false
 *   springdoc.swagger-ui.enabled=false
 */
@Configuration
public class OpenApiConfig {

    private static final String SCHEME_NAME = "bearerAuth";

    @Value("${server.port:8080}")
    private String port;

    @Bean
    public OpenAPI shifaOpenAPI() {
        return new OpenAPI()
            .info(apiInfo())
            .servers(servers())
            // Apply JWT scheme globally — Swagger UI shows "Authorize" button
            .addSecurityItem(new SecurityRequirement().addList(SCHEME_NAME))
            .components(new Components()
                .addSecuritySchemes(SCHEME_NAME, jwtScheme()))
            .tags(tags());
    }

    // ─────────────────────────────────────────────────────────────
    // API Info
    // ─────────────────────────────────────────────────────────────

    private Info apiInfo() {
        return new Info()
            .title("Shifa API — AI-Powered Post-Visit Medical Companion")
            .version("v1.0.0")
            .description("""
                ## Shifa Health Platform
                
                Converts doctor's notes into simple multilingual summaries
                sent to Indian patients via WhatsApp in their native language.
                
                ### Authentication Flows
                | Actor | Flow |
                |---|---|
                | **Doctor** | `POST /auth/login` → `accessToken` → Bearer header |
                | **Patient OTP** | `POST /auth/patient/otp/request` → OTP on WhatsApp → `POST /auth/patient/otp/verify` → `accessToken` |
                | **Patient Portal** | No auth — token from WhatsApp link → `GET /public/visits/{token}` |
                
                ### Languages Supported
                English · हिन्दी · தமிழ் · తెలుగు · বাংলা · मराठी · ગુજરાતી · ಕನ್ನಡ · മലയാളം · ਪੰਜਾਬੀ
                
                ### Compliance
                DPDP Act 2023 · All data stored in **AWS Mumbai (ap-south-1)**
                """)
            .contact(new Contact()
                .name("Shifa Engineering")
                .email("engineering@shifa.health")
                .url("https://shifa.health"))
            .license(new License()
                .name("Proprietary")
                .url("https://shifa.health/terms"));
    }

    // ─────────────────────────────────────────────────────────────
    // Servers
    // ─────────────────────────────────────────────────────────────

    private List<Server> servers() {
        return List.of(
            new Server().url("http://localhost:" + port)
                        .description("Local Development"),
            new Server().url("https://api-staging.shifa.health")
                        .description("Staging — AWS Mumbai"),
            new Server().url("https://api.shifa.health")
                        .description("Production — AWS Mumbai")
        );
    }

    // ─────────────────────────────────────────────────────────────
    // JWT Security Scheme
    // ─────────────────────────────────────────────────────────────

    private SecurityScheme jwtScheme() {
        return new SecurityScheme()
            .type(SecurityScheme.Type.HTTP)
            .scheme("bearer")
            .bearerFormat("JWT")
            .name(SCHEME_NAME)
            .description("""
                Token from `POST /api/v1/auth/login` or `POST /api/v1/auth/patient/otp/verify`.
                Paste the `accessToken` value here (without 'Bearer ' prefix).
                Valid for 24 hours.
                """);
    }

    // ─────────────────────────────────────────────────────────────
    // Tags — groups endpoints in Swagger UI sidebar
    // ─────────────────────────────────────────────────────────────

    private List<Tag> tags() {
        return List.of(
            new Tag().name("Authentication")
                     .description("Doctor and patient login, OTP, refresh, logout"),
            new Tag().name("Doctors")
                     .description("Doctor profile and dashboard statistics"),
            new Tag().name("Patients")
                     .description("Patient registration, search, medical history"),
            new Tag().name("Visits")
                     .description("Create visits, AI processing, send summaries"),
            new Tag().name("Patient Portal")
                     .description("Public token-based access to visit summary (no auth)"),
            new Tag().name("Languages")
                     .description("List of supported Indian languages"),
            new Tag().name("Webhooks")
                     .description("WhatsApp Cloud API incoming events"),
            new Tag().name("Admin")
                     .description("Platform statistics — ADMIN role required")
        );
    }
}
