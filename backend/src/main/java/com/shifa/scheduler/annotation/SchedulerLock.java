package com.shifa.scheduler.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface SchedulerLock {

    String lockName();

    int atMostForSeconds() default 55;
}
