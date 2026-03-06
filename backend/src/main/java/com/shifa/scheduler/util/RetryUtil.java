package com.shifa.scheduler.util;

import lombok.extern.slf4j.Slf4j;
import java.util.function.Supplier;

@Slf4j
public final class RetryUtil {

    private RetryUtil() {
    }

    public static <T> T withRetry(
            Supplier<T> supplier,
            int maxAttempts,
            long baseDelayMs,
            String context) {
        Exception lastException = null;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return supplier.get();
            } catch (Exception ex) {
                lastException = ex;
                log.warn("[RETRY] {} \u2014 attempt {}/{} failed: {}", context, attempt, maxAttempts, ex.getMessage());

                if (attempt < maxAttempts) {
                    long waitMs = baseDelayMs * (1L << (attempt - 1));
                    try {
                        Thread.sleep(waitMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Retry interrupted: " + context, ie);
                    }
                }
            }
        }
        throw new RuntimeException("All " + maxAttempts + " attempts failed for: " + context, lastException);
    }

    public static <T> T withRetry(Supplier<T> supplier, String context) {
        return withRetry(supplier, 3, 2_000L, context);
    }
}
