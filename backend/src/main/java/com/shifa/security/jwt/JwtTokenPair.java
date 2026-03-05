package com.shifa.security.jwt;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class JwtTokenPair {
    String accessToken;
    String refreshToken;
    long accessExpiresIn;
    long refreshExpiresIn;
}
