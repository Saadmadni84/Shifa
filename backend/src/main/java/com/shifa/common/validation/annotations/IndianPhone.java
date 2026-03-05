package com.shifa.common.validation.annotations;

import com.shifa.common.validation.validators.IndianPhoneValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = IndianPhoneValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface IndianPhone {
    String message() default "Must be a valid Indian mobile number (+91 or 10-digit starting with 6-9)";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
