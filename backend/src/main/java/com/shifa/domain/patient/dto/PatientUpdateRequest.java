package com.shifa.domain.patient.dto;

import com.shifa.common.validation.annotations.IndianPhone;
import com.shifa.common.validation.annotations.ValidAbhaId;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
public class PatientUpdateRequest {

    @Size(min = 2, max = 100)
    private String firstName;

    @Size(min = 2, max = 100)
    private String lastName;

    @Email
    private String email;

    @Past
    private LocalDate dateOfBirth;

    @Pattern(regexp = "MALE|FEMALE|OTHER|PREFER_NOT_TO_SAY")
    private String gender;

    @ValidAbhaId
    private String abhaId;

    @Pattern(regexp = "EN|HI|TA|TE|BN|MR|GU|KN|ML|PA|UR|OR")
    private String preferredLanguage;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String state;

    @Pattern(regexp = "\\d{6}")
    private String pincode;

    @Pattern(regexp = "A\\+|A-|B\\+|B-|O\\+|O-|AB\\+|AB-")
    private String bloodGroup;

    @IndianPhone
    private String emergencyContactPhone;

    @Size(max = 100)
    private String emergencyContactName;

    private List<String> allergies;
    private List<String> chronicConditions;
}
