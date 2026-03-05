package com.shifa.security.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RateLimited {
    String key();

    int limit() default 100;

    String per() default "DAY";
}
