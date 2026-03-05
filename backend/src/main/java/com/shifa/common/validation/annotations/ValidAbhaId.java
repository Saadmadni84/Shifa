package com.shifa.common.validation.annotations;

import com.shifa.common.validation.validators.AbhaIdValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = AbhaIdValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidAbhaId {
    String message() default "Invalid ABHA ID format. Must be 14 digits (XX-XXXX-XXXX-XXXX)";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
