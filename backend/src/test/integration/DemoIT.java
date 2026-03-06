package com.shifa.demo;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shifa.demo.dto.DemoChatDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * DemoIT — Integration tests for all /api/v1/demo/** endpoints.
 *
 * Tests:
 *   1. All patient endpoints (list, detail, visit, chat)
 *   2. All doctor endpoints (list, detail, patients, audit)
 *   3. Authentication — demo endpoints require NO token
 *   4. Validation — invalid IDs return 404, bad requests return 400
 *   5. Response shape matches frontend expectations
 *
 * Run: mvn test -Dtest=DemoIT
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Demo API Integration Tests")
class DemoIT {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    private static final String BASE = "/api/v1/demo";

    // ═══════════════════════════════════════════════════════════════════════════
    // PATIENT TESTS
    // ═══════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("GET /demo/patients → 200 with 3 patients, no auth required")
    void listPatients_returnsThreePatients() throws Exception {
        mockMvc.perform(get(BASE + "/patients"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$", hasSize(3)))
            // Verify Arjun
            .andExpect(jsonPath("$[0].id",           is("pat-001")))
            .andExpect(jsonPath("$[0].name",          is("Arjun Sharma")))
            .andExpect(jsonPath("$[0].languageCode",  is("hi")))
            .andExpect(jsonPath("$[0].specialty",     is("cardiology")))
            // Verify Priya
            .andExpect(jsonPath("$[1].id",            is("pat-002")))
            .andExpect(jsonPath("$[1].name",          is("Priya Patel")))
            .andExpect(jsonPath("$[1].languageCode",  is("gu")))
            // Verify Ravi
            .andExpect(jsonPath("$[2].id",            is("pat-003")))
            .andExpect(jsonPath("$[2].name",          is("Ravi Kumar")))
            .andExpect(jsonPath("$[2].languageCode",  is("kn")));
    }

    @ParameterizedTest
    @CsvSource({
        "pat-001, Arjun Sharma,  hi, cardiology",
        "pat-002, Priya Patel,   gu, endocrinology",
        "pat-003, Ravi Kumar,    kn, pulmonology"
    })
    @DisplayName("GET /demo/patients/{id} → returns correct patient with visits")
    void getPatient_returnsCorrectPatientWithVisits(
        String id, String name, String lang, String specialty
    ) throws Exception {
        mockMvc.perform(get(BASE + "/patients/" + id))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id",           is(id)))
            .andExpect(jsonPath("$.name",          is(name)))
            .andExpect(jsonPath("$.languageCode",  is(lang)))
            .andExpect(jsonPath("$.specialty",     is(specialty)))
            .andExpect(jsonPath("$.visits",        hasSize(greaterThanOrEqualTo(1))))
            .andExpect(jsonPath("$.visits[0].sections.chiefComplaint", notNullValue()))
            .andExpect(jsonPath("$.visits[0].sections.medications",    hasSize(greaterThan(0))))
            .andExpect(jsonPath("$.visits[0].sections.testResults",    hasSize(greaterThan(0))))
            .andExpect(jsonPath("$.visits[0].sections.nextActions",    hasSize(greaterThan(0))));
    }

    @Test
    @DisplayName("GET /demo/patients/nonexistent → 404")
    void getPatient_unknownId_returns404() throws Exception {
        mockMvc.perform(get(BASE + "/patients/pat-999"))
            .andExpect(status().isNotFound());
    }

    @ParameterizedTest
    @CsvSource({
        "pat-001, visit-001-a",
        "pat-002, visit-002-a",
        "pat-003, visit-003-a"
    })
    @DisplayName("GET /demo/patients/{id}/visits/{vid} → returns full visit")
    void getVisit_returnsFullSoapData(String patientId, String visitId) throws Exception {
        mockMvc.perform(get(BASE + "/patients/" + patientId + "/visits/" + visitId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id",                         is(visitId)))
            .andExpect(jsonPath("$.quickSummary",               notNullValue()))
            .andExpect(jsonPath("$.sections.assessment",        notNullValue()))
            .andExpect(jsonPath("$.sections.diagnosis",         notNullValue()))
            .andExpect(jsonPath("$.sections.plan",              hasSize(greaterThan(0))))
            .andExpect(jsonPath("$.sections.transcript",        notNullValue()));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // AI CHAT TESTS
    // ═══════════════════════════════════════════════════════════════════════════

    @ParameterizedTest
    @CsvSource({
        "pat-001, visit-001-a, What does my diagnosis mean?, en",
        "pat-001, visit-001-a, Dawa ke side effects kya hain?, hi",
        "pat-002, visit-002-a, HbA1c matlab kya hota hai?, hi",
        "pat-002, visit-002-a, Metformin ni dose kem vadhi?, gu",
        "pat-003, visit-003-a, Inhaler kaise use karte hain?, hi",
        "pat-003, visit-003-a, Steroid baadha aagattha?, kn"
    })
    @DisplayName("POST /demo/.../chat → 200 with contextual AI response")
    void chat_returnsContextualResponse(
        String patientId, String visitId, String message, String lang
    ) throws Exception {
        var request = new DemoChatDTO.Request(message, lang);

        mockMvc.perform(post(BASE + "/patients/" + patientId + "/visits/" + visitId + "/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.role",       is("assistant")))
            .andExpect(jsonPath("$.content",    not(emptyString())))
            .andExpect(jsonPath("$.isDemoMode", is(true)))
            .andExpect(jsonPath("$.disclaimer", notNullValue()));
    }

    @Test
    @DisplayName("POST /demo/.../chat with blank message → 400")
    void chat_blankMessage_returns400() throws Exception {
        var request = new DemoChatDTO.Request("", "en");

        mockMvc.perform(post(BASE + "/patients/pat-001/visits/visit-001-a/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /demo/.../chat with too long message → 400")
    void chat_tooLongMessage_returns400() throws Exception {
        var request = new DemoChatDTO.Request("A".repeat(2001), "en");

        mockMvc.perform(post(BASE + "/patients/pat-001/visits/visit-001-a/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DOCTOR TESTS
    // ═══════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("GET /demo/doctors → 200 with 3 doctors, no auth required")
    void listDoctors_returnsThreeDoctors() throws Exception {
        mockMvc.perform(get(BASE + "/doctors"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$",        hasSize(3)))
            .andExpect(jsonPath("$[0].id",  is("doc-001")))
            .andExpect(jsonPath("$[1].id",  is("doc-002")))
            .andExpect(jsonPath("$[2].id",  is("doc-003")));
    }

    @ParameterizedTest
    @CsvSource({
        "doc-001, Dr. Ananya Krishnan, Cardiology",
        "doc-002, Dr. Suresh Mehta,   Endocrinology & Diabetology",
        "doc-003, Dr. Kavita Rao,     Pulmonology & Respiratory Medicine"
    })
    @DisplayName("GET /demo/doctors/{id} → returns correct doctor with stats")
    void getDoctor_returnsCorrectDoctor(String id, String name, String specialty) throws Exception {
        mockMvc.perform(get(BASE + "/doctors/" + id))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id",              is(id)))
            .andExpect(jsonPath("$.name",            is(name)))
            .andExpect(jsonPath("$.specialty",       is(specialty)))
            .andExpect(jsonPath("$.stats",           notNullValue()))
            .andExpect(jsonPath("$.stats.totalPatients", greaterThan(0)));
    }

    @Test
    @DisplayName("GET /demo/doctors/{id}/patients → returns doctor's patients")
    void getDoctorPatients_returnsAssignedPatients() throws Exception {
        mockMvc.perform(get(BASE + "/doctors/doc-001/patients"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$",                hasSize(1)))
            .andExpect(jsonPath("$[0].id",          is("pat-001")))
            .andExpect(jsonPath("$[0].name",        is("Arjun Sharma")));
    }

    @ParameterizedTest
    @CsvSource({
        "doc-001, pat-001",
        "doc-002, pat-002",
        "doc-003, pat-003"
    })
    @DisplayName("GET /demo/doctors/{did}/patients/{pid}/audit → returns 3 audit items")
    void getAiAudit_returnsAuditItems(String doctorId, String patientId) throws Exception {
        mockMvc.perform(get(BASE + "/doctors/" + doctorId + "/patients/" + patientId + "/audit"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$",          hasSize(3)))
            .andExpect(jsonPath("$[0].question", notNullValue()))
            .andExpect(jsonPath("$[0].aiSummary", notNullValue()));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SECURITY TESTS
    // ═══════════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("Demo endpoints are accessible WITHOUT Authorization header")
    void demoEndpoints_noAuthRequired() throws Exception {
        // No Authorization header — should succeed for all demo endpoints
        mockMvc.perform(get(BASE + "/patients"))
            .andExpect(status().isOk());

        mockMvc.perform(get(BASE + "/doctors"))
            .andExpect(status().isOk());
    }
}