package com.shifa.config.security;

import java.io.IOException;

import org.slf4j.MDC;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.shifa.common.constants.ShifaConstants;
import com.shifa.domain.user.User;
import com.shifa.domain.user.UserRepository;
import com.shifa.security.dto.UserPrincipal;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component("configJwtAuthFilter")
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader(ShifaConstants.AUTH_HEADER);
        final String jwt;
        final String userEmailOrPhone;

        if (authHeader == null || !authHeader.startsWith(ShifaConstants.BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            jwt = authHeader.substring(ShifaConstants.BEARER_PREFIX.length());
            userEmailOrPhone = jwtService.extractUsername(jwt);

            if (userEmailOrPhone != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmailOrPhone);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    User user = userRepository.findByEmailOrPhoneNumber(userEmailOrPhone, userEmailOrPhone)
                            .orElseThrow(() -> new IllegalStateException("User not found for token subject"));
                    UserPrincipal principal = UserPrincipal.from(user);

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            principal.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    // Enrich MDC for structured logging
                    MDC.put("userId", principal.getUserId().toString());
                    if (!principal.getAuthorities().isEmpty()) {
                        MDC.put("userRole", principal.getAuthorities().iterator().next().getAuthority());
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("JWT Authentication failed: {}", ex.getMessage());
            // Security Context remains null, effectively anonymous
        } finally {
            try {
                filterChain.doFilter(request, response);
            } finally {
                MDC.remove("userId");
                MDC.remove("userRole");
            }
        }
    }
}
