package com.shifa.common.util;

import com.shifa.common.constants.ShifaConstants;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public final class TimeUtils {

    private static final ZoneId IST_ZONE = ZoneId.of(ShifaConstants.IST_TIMEZONE);

    private TimeUtils() {
        // Prevent instantiation
    }

    public static LocalDateTime getIstNow() {
        return ZonedDateTime.now(IST_ZONE).toLocalDateTime();
    }

    public static LocalDateTime convertToIst(Instant instant) {
        if (instant == null) {
            return null;
        }
        return instant.atZone(IST_ZONE).toLocalDateTime();
    }
}
