package com.shifa.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class AbhaIdValidator implements ConstraintValidator<AbhaId, String> {

    // Matches 14-digit ABHA ID, e.g., 91-0000-0000-0000 or 91000000000000
    private static final String ABHA_REGEX = "^\\d{2}-?\\d{4}-?\\d{4}-?\\d{4}$";

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return true;
        }
        return value.matches(ABHA_REGEX);
    }
}
