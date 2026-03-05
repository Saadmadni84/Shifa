package com.shifa.common.validation.validators;

import com.shifa.common.validation.annotations.IndianPhone;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class IndianPhoneValidator implements ConstraintValidator<IndianPhone, String> {

    private static final Pattern PATTERN = Pattern.compile(
        "^(\\+91|91)?[6-9]\\d{9}$"
    );

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) return true;
        String cleaned = value.replaceAll("[\\s\\-()]+", "");
        return PATTERN.matcher(cleaned).matches();
    }
}
