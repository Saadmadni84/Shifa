package com.shifa.domain.patient.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PatientResponse {

    String id;
    String firstName;
    String lastName;
    String fullName;
    String phoneNumber;
    String email;
    LocalDate dateOfBirth;
    int age;
    String gender;
    String abhaId;
    String preferredLanguage;
    String preferredLanguageDisplay;
    String city;
    String state;
    String pincode;
    String bloodGroup;
    String emergencyContactName;
    String emergencyContactPhone;
    List<String> allergies;
    List<String> chronicConditions;

    int totalVisits;
    LocalDate lastVisitDate;
    String lastDiagnosis;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
