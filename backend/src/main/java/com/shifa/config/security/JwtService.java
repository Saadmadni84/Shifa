package com.shifa.config.security;

import com.shifa.config.properties.ShifaProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtService {

    private final ShifaProperties.JwtProperties jwtProperties;
    private final StringRedisTemplate redisTemplate;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, jwtProperties.getExpirationMs());
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails, jwtProperties.getRefreshExpirationMs());
    }

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
        String jti = UUID.randomUUID().toString();
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setId(jti)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token) && !isTokenRevoked(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtProperties.getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public void revokeToken(String token) {
        Claims claims = extractAllClaims(token);
        String jti = claims.getId();
        Date expiration = claims.getExpiration();
        long diff = expiration.getTime() - System.currentTimeMillis();
        
        if (diff > 0) {
            redisTemplate.opsForValue().set("jwt:blocked:" + jti, "true", diff, TimeUnit.MILLISECONDS);
            log.info("Token revoked: {}", jti);
        }
    }
    
    public void revokeAllTokensForUser(String username) {
        long duration = Math.max(jwtProperties.getExpirationMs(), jwtProperties.getRefreshExpirationMs());
        redisTemplate.opsForValue().set("jwt:invalidated:user:" + username, String.valueOf(System.currentTimeMillis()), duration, TimeUnit.MILLISECONDS);
        log.info("All tokens revoked for user: {}", username);
    }

    public boolean isTokenRevoked(String token) {
        try {
            String jti = extractClaim(token, Claims::getId);
            if (Boolean.TRUE.equals(redisTemplate.hasKey("jwt:blocked:" + jti))) {
                return true;
            }
            
            Date issuedAt = extractClaim(token, Claims::getIssuedAt);
            String username = extractUsername(token);
            String blockTimeStr = redisTemplate.opsForValue().get("jwt:invalidated:user:" + username);
            if (blockTimeStr != null) {
                long blockTime = Long.parseLong(blockTimeStr);
                if (issuedAt.getTime() < blockTime) {
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            return true; // fail safe
        }
    }
}
