package com.shifa.domain.patient.dto;

import com.shifa.common.validation.annotations.IndianPhone;
import com.shifa.common.validation.annotations.ValidAbhaId;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
public class PatientCreateRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 100)
    private String lastName;

    @NotBlank(message = "Mobile number is required for WhatsApp delivery")
    @IndianPhone
    private String phoneNumber;

    @Email(message = "Invalid email address")
    private String email;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @Pattern(regexp = "MALE|FEMALE|OTHER|PREFER_NOT_TO_SAY",
             message = "Invalid gender value")
    private String gender;

    @ValidAbhaId
    private String abhaId;

    @NotBlank(message = "Preferred language is required")
    @Pattern(regexp = "EN|HI|TA|TE|BN|MR|GU|KN|ML|PA|UR|OR",
             message = "Invalid language code")
    private String preferredLanguage = "HI";

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String state;

    @Pattern(regexp = "\\d{6}", message = "Pincode must be 6 digits")
    private String pincode;

    @Pattern(regexp = "A\\+|A-|B\\+|B-|O\\+|O-|AB\\+|AB-",
             message = "Invalid blood group")
    private String bloodGroup;

    @Size(max = 15)
    @IndianPhone
    private String emergencyContactPhone;

    @Size(max = 100)
    private String emergencyContactName;

    @Size(max = 20, message = "Maximum 20 allergies can be entered")
    private List<@NotBlank @Size(max = 200) String> allergies = new ArrayList<>();

    @Size(max = 20, message = "Maximum 20 conditions can be entered")
    private List<@NotBlank @Size(max = 200) String> chronicConditions = new ArrayList<>();
}
