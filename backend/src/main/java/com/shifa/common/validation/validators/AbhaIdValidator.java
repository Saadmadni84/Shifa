package com.shifa.common.validation.validators;

import com.shifa.common.validation.annotations.ValidAbhaId;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class AbhaIdValidator implements ConstraintValidator<ValidAbhaId, String> {

    private static final Pattern PATTERN = Pattern.compile(
        "^(\\d{2}-\\d{4}-\\d{4}-\\d{4}|\\d{14})$"
    );

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) return true;
        return PATTERN.matcher(value.trim()).matches();
    }
}
