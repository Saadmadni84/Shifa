package com.shifa.service.dto;

import lombok.Data;

@Data
public class PatientCreateRequest {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Integer age;
    private String gender;
    private String preferredLanguage;
    private String abhaId;
    private String address;
    private String knownConditions;
    private String allergies;
}
