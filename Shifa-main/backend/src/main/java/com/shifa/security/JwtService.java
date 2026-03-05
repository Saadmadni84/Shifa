package com.shifa.security;

import org.springframework.stereotype.Service;

@Service
public class JwtService {

    public String generateToken(String subject) {
        return "token-for-" + subject;
    }
}
