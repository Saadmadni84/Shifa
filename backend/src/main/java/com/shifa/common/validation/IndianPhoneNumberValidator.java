package com.shifa.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class IndianPhoneNumberValidator implements ConstraintValidator<IndianPhoneNumber, String> {

    private static final String PHONE_REGEX = "^(?:(?:\\+|00)91|91|0)?[6-9]\\d{9}$";

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return true; // Use @NotBlank for null checks
        }
        return value.matches(PHONE_REGEX);
    }
}
