package com.shifa.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class IndianPinCodeValidator implements ConstraintValidator<IndianPinCode, String> {

    private static final String PIN_REGEX = "^[1-9][0-9]{5}$";

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return true;
        }
        return value.matches(PIN_REGEX);
    }
}
