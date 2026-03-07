package com.shifa.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController("apiAuthController")
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*") // Allow localhost
public class AuthController {

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        
        Map<String, Object> user = new HashMap<>();
        user.put("id", 1);
        user.put("firstName", payload.get("firstName"));
        user.put("lastName", payload.get("lastName"));
        user.put("email", payload.get("email"));
        user.put("role", "DOCTOR");
        
        Map<String, Object> data = new HashMap<>();
        data.put("accessToken", "mock-access-token-1234");
        data.put("refreshToken", "mock-refresh-token-5678");
        data.put("user", user);

        response.put("data", data);
        response.put("status", "success");

        return ResponseEntity.ok(data); // frontend api wrapper destructures { data } natively in axios interceptor sometimes or directly returns data
    }
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, Object> payload) {
        Map<String, Object> user = new HashMap<>();
        user.put("id", 1);
        user.put("email", payload.get("email"));
        user.put("role", "DOCTOR");
        
        Map<String, Object> data = new HashMap<>();
        data.put("accessToken", "mock-access-token-1234");
        data.put("refreshToken", "mock-refresh-token-5678");
        data.put("user", user);

        return ResponseEntity.ok(data);
    }
}
