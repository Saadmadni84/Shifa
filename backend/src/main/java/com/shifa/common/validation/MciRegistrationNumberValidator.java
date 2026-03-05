package com.shifa.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class MciRegistrationNumberValidator implements ConstraintValidator<MciRegistrationNumber, String> {

    // Basic regex: Optional state code + alphabets/digits up to 15 chars. (E.g., "MCI-12345", "DMC/123", "G-12345")
    private static final String REG_REGEX = "^[A-Za-z0-9/-]{5,20}$";

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return true;
        }
        return value.matches(REG_REGEX);
    }
}
