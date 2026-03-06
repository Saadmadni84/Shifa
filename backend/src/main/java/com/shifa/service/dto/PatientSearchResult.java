package com.shifa.service.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.util.UUID;

@Value
@Builder
public class PatientSearchResult {
    UUID id;
    String firstName;
    String lastName;
    String phoneNumber;
    Integer age;
    String gender;
    String preferredLanguage;
    LocalDate lastVisitDate;
}
