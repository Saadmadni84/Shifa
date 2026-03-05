package com.shifa.config;

import com.shifa.config.security.JwtAuthFilter;
import com.shifa.config.security.ShifaAccessDeniedHandler;
import com.shifa.config.security.ShifaAuthEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Spring Security 6 configuration for Shifa.
 *
 * Architecture: fully stateless JWT — no sessions, no cookies for APIs.
 *
 * URL access rules:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ PUBLIC (no token)                                               │
 * │  POST /api/v1/auth/**            doctor + patient auth          │
 * │  GET  /api/v1/public/**          patient portal (token link)    │
 * │  POST /api/v1/public/*/ask       patient Q&A                    │
 * │  GET  /api/v1/webhooks/**        WhatsApp verify                │
 * │  POST /api/v1/webhooks/**        WhatsApp events                │
 * │  GET  /api/v1/languages          language list                  │
 * │  GET  /actuator/health           ALB health probe               │
 * │  GET  /v3/api-docs/**            Swagger (dev only)             │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ DOCTOR / ADMIN                                                  │
 * │  ALL  /api/v1/visits/**                                         │
 * │  ALL  /api/v1/doctors/**                                        │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ DOCTOR / ADMIN / RECEPTIONIST                                   │
 * │  ALL  /api/v1/patients/**                                       │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ ADMIN only                                                      │
 * │  ALL  /api/v1/admin/**                                          │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * @EnableMethodSecurity allows @PreAuthorize on service methods for
 * ownership checks (e.g. doctor can only see their own patients).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final CorsConfigurationSource corsConfigurationSource;
    private final ShifaAuthEntryPoint authEntryPoint;
    private final ShifaAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            // ── No CSRF (stateless), CORS from WebConfig ─────────────────
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource))

            // ── Stateless — no HTTP session ──────────────────────────────
            .sessionManagement(s ->
                s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // ── URL authorization rules ──────────────────────────────────
            .authorizeHttpRequests(auth -> auth

                // Public GET endpoints
                .requestMatchers(HttpMethod.GET,
                    "/api/v1/languages",
                    "/api/v1/public/**",
                    "/api/v1/webhooks/whatsapp",
                    "/actuator/health",
                    "/actuator/info",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()

                // Public POST endpoints
                .requestMatchers(HttpMethod.POST,
                    "/api/v1/auth/register",
                    "/api/v1/auth/login",
                    "/api/v1/auth/patient/otp/request",
                    "/api/v1/auth/patient/otp/verify",
                    "/api/v1/auth/refresh",
                    "/api/v1/public/*/ask",
                    "/api/v1/webhooks/whatsapp"
                ).permitAll()

                // Admin only
                .requestMatchers("/api/v1/admin/**")
                    .hasRole("ADMIN")

                // Doctor / Admin: visits and doctor profile
                .requestMatchers("/api/v1/visits/**")
                    .hasAnyRole("DOCTOR", "ADMIN")
                .requestMatchers("/api/v1/doctors/**")
                    .hasAnyRole("DOCTOR", "ADMIN")

                // Doctor / Admin / Receptionist: patients
                .requestMatchers("/api/v1/patients/**")
                    .hasAnyRole("DOCTOR", "ADMIN", "RECEPTIONIST")

                // Prometheus metrics: admin + network-level restriction in prod
                .requestMatchers("/actuator/prometheus", "/actuator/metrics")
                    .hasRole("ADMIN")

                // Everything else needs a valid JWT
                .anyRequest().authenticated()
            )

            // ── JSON 401 / 403 instead of Spring's HTML error pages ──────
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authEntryPoint)
                .accessDeniedHandler(accessDeniedHandler)
            )

            // ── Security response headers ─────────────────────────────────
            .headers(h -> h
                .frameOptions(f -> f.deny())
                .contentSecurityPolicy(csp -> csp.policyDirectives(
                    "default-src 'self'; script-src 'self'; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "img-src 'self' data: https:; connect-src 'self'"))
                .httpStrictTransportSecurity(hsts -> hsts
                    .maxAgeInSeconds(31_536_000)
                    .includeSubDomains(true))
                .referrerPolicy(ref -> ref
                    .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy
                        .STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
            )

            // ── JWT filter runs before Spring's username/password filter ──
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

            .build();
    }

    // ─────────────────────────────────────────────────────────────
    // Auth provider, manager, password encoder
    // ─────────────────────────────────────────────────────────────

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * BCrypt strength 12 — ~4× slower per hash than the default of 10.
     * Negligible on login (one operation), meaningful barrier for brute-force.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
