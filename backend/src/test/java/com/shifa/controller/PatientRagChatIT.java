package com.shifa.controller;

import static org.hamcrest.Matchers.containsString;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shifa.domain.patient.Patient;
import com.shifa.domain.patient.PatientRepository;
import com.shifa.domain.user.User;
import com.shifa.domain.user.UserRepository;
import com.shifa.security.dto.UserPrincipal;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Patient RAG Chat Security & Context Integration Tests")
class PatientRagChatIT {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private PatientRepository patientRepository;

    private User userA;
    private Patient patientA;

    @BeforeEach
    void setUp() {
        String phone = "999" + (System.currentTimeMillis() % 10000000);
        userA = new User();
        userA.setPhoneNumber(phone);
        userA.setDisplayName("Saad Madni");
        userA.setRole("PATIENT");
        userA = userRepository.save(userA);

        patientA = new Patient();
        patientA.setUser(userA);
        patientA.setFirstName("Saad");
        patientA.setLastName("Madni");
        patientA.setPhoneNumber(userA.getPhoneNumber());
        patientA = patientRepository.save(patientA);
    }

    private void authenticateAs(User user) {
        UserPrincipal principal = UserPrincipal.builder()
                .userId(user.getId())
                .username(user.getPhoneNumber())
                .role("PATIENT")
                .displayName(user.getDisplayName())
                .enabled(true)
                .deleted(false)
                .build();

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        
    }

    @Test
    @DisplayName("Test 1: Unauthenticated RAG request returns 401 Unauthorized")
    void test1_unauthenticated_returns401() throws Exception {
        SecurityContextHolder.clearContext();
        var req = new PatientRagChatController.PatientChatRequest("hi", null, "en");

        mockMvc.perform(post("/api/patient/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test 2: Authenticated Patient Saad Madni asks 'What is my name?' -> returns Saad Madni")
    void test2_patientIdentity_returnsName() throws Exception {
        authenticateAs(userA);
        var req = new PatientRagChatController.PatientChatRequest("What is my name?", null, "en");

            mockMvc.perform(post("/api/patient/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer", containsString("Saad Madni")));
    }

    @Test
    @DisplayName("Test 3: Patient with empty medications asks about medications -> states none recorded")
    void test3_emptyMedications_statesNoneRecorded() throws Exception {
        authenticateAs(userA);
        var req = new PatientRagChatController.PatientChatRequest("What are my current medications?", null, "en");

        mockMvc.perform(post("/api/patient/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer", containsString("don't have any medications recorded")));
    }
}
