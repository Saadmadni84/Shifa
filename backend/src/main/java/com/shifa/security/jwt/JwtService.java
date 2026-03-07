package com.shifa.security.jwt;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.shifa.security.service.TokenBlacklistService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service("tokenJwtService")
@RequiredArgsConstructor
@Slf4j
public class JwtService {

    private final JwtProperties jwtProperties;
    private final TokenBlacklistService blacklistService;

    public String generateAccessToken(UserDetails userDetails, UUID userId, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId.toString());
        claims.put("role", role);
        claims.put("type", "ACCESS");

        return buildToken(userDetails.getUsername(), claims, jwtProperties.getExpiryMs());
    }

    public String generateRefreshToken() {
        return UUID.randomUUID().toString().replace("-", "") +
                UUID.randomUUID().toString().replace("-", "");
    }

    private String buildToken(String subject, Map<String, Object> claims, long ttlMs) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .id(UUID.randomUUID().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ttlMs))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            String username = extractUsername(token);
            String jti = extractJti(token);

            return username.equals(userDetails.getUsername())
                    && !isTokenExpired(token)
                    && !blacklistService.isBlacklisted(jti);

        } catch (JwtException | IllegalArgumentException e) {
            log.warn("[JWT] Invalid token: {}", e.getMessage());
            return false;
        }
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractJti(String token) {
        return extractClaim(token, Claims::getId);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public UUID extractUserId(String token) {
        String raw = extractClaim(token, claims -> claims.get("userId", String.class));
        return raw != null ? UUID.fromString(raw) : null;
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(parseAllClaims(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Claims parseAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtProperties.getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
