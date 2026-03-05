package com.shifa.common.validation.validators;

import com.shifa.common.validation.annotations.StrongPassword;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.ArrayList;
import java.util.List;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext ctx) {
        if (value == null) return true;

        boolean hasMinLength   = value.length() >= 8;
        boolean hasUppercase   = value.chars().anyMatch(Character::isUpperCase);
        boolean hasDigit       = value.chars().anyMatch(Character::isDigit);
        boolean hasSpecial     = value.chars().anyMatch(c -> "!@#$%^&*()_+-=[]{}|;:,.<>?".indexOf(c) >= 0);

        if (hasMinLength && hasUppercase && hasDigit && hasSpecial) return true;

        List<String> missing = new ArrayList<>();
        if (!hasMinLength) missing.add("at least 8 characters");
        if (!hasUppercase) missing.add("one uppercase letter");
        if (!hasDigit)     missing.add("one digit");
        if (!hasSpecial)   missing.add("one special character");

        ctx.disableDefaultConstraintViolation();
        ctx.buildConstraintViolationWithTemplate(
            "Password must contain: " + String.join(", ", missing)
        ).addConstraintViolation();

        return false;
    }
}
