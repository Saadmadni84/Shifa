package com.shifa.scheduler.util;

import java.time.*;
import java.time.format.DateTimeFormatter;

public final class ISTTimeUtil {

    public static final ZoneId IST = ZoneId.of("Asia/Kolkata");
    public static final ZoneId UTC = ZoneId.of("UTC");

    private static final DateTimeFormatter DISPLAY_FORMAT = DateTimeFormatter.ofPattern("d MMMM yyyy, h:mm a");

    private ISTTimeUtil() {
    }

    public static ZonedDateTime nowIST() {
        return ZonedDateTime.now(IST);
    }

    public static ZonedDateTime toIST(LocalDateTime utcTime) {
        if (utcTime == null)
            return null;
        return utcTime.atZone(UTC).withZoneSameInstant(IST);
    }

    public static LocalDateTime toUTC(ZonedDateTime istTime) {
        if (istTime == null)
            return null;
        return istTime.withZoneSameInstant(UTC).toLocalDateTime();
    }

    public static String format(LocalDateTime utcTime) {
        if (utcTime == null)
            return null;
        return toIST(utcTime).format(DISPLAY_FORMAT);
    }

    public static boolean isWithinQuietHours(LocalDateTime utcTime) {
        int hour = toIST(utcTime).getHour();
        return hour < 8 || hour >= 21;
    }

    public static LocalDateTime nextMorning8AM() {
        ZonedDateTime tomorrow8AM = nowIST()
                .plusDays(1)
                .withHour(8).withMinute(0).withSecond(0).withNano(0);
        return toUTC(tomorrow8AM);
    }

    public static long daysUntil(LocalDateTime futureUtc) {
        LocalDate futureIST = toIST(futureUtc).toLocalDate();
        LocalDate todayIST = nowIST().toLocalDate();
        return java.time.temporal.ChronoUnit.DAYS.between(todayIST, futureIST);
    }
}
