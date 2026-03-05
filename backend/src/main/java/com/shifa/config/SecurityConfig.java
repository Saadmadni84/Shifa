package com.shifa.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * SecurityConfig — Shifa Spring Security Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * KEY SECTION for demo:
 *   Line marked ★ — /api/v1/demo/** is fully public (no JWT required).
 *
 * This enables the frontend demo mode without any authentication,
 * while all other doctor/patient routes remain protected.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ── CSRF disabled (REST API — stateless JWT) ────────────────────
            .csrf(AbstractHttpConfigurer::disable)

            // ── CORS ────────────────────────────────────────────────────────
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ── Stateless session (JWT) ─────────────────────────────────────
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // ── Authorization rules ─────────────────────────────────────────
            .authorizeHttpRequests(auth -> auth

                // ── Public: Swagger / OpenAPI ──────────────────────────────
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/actuator/health"
                ).permitAll()

                // ── Public: Auth endpoints ─────────────────────────────────
                .requestMatchers(
                    "/api/v1/auth/**"
                ).permitAll()

                // ── Public: Patient portal (WhatsApp token link) ───────────
                .requestMatchers(
                    "/api/v1/public/**"
                ).permitAll()

                // ─────────────────────────────────────────────────────────────
                // ★ DEMO — fully public, no JWT required
                //   All GET and POST endpoints under /api/v1/demo/** are open.
                //   This is intentional — demo data is entirely fictional.
                //   Rate limiting is applied at the nginx/gateway level.
                // ─────────────────────────────────────────────────────────────
                .requestMatchers("/api/v1/demo/**").permitAll()

                // ── Public: Language list ──────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/v1/languages").permitAll()

                // ── Doctor role required ───────────────────────────────────
                .requestMatchers("/api/v1/doctor/**").hasRole("DOCTOR")

                // ── All other requests require authentication ───────────────
                .anyRequest().authenticated()
            )

            // ── JWT filter ──────────────────────────────────────────────────
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(
            "http://localhost:5173",    // Vite dev server
            "http://localhost:3000",    // Alternative dev port
            "https://shifa.health",    // Production
            "https://*.shifa.health"   // Subdomains (staging, etc.)
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}

