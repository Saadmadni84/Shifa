package com.shifa.scheduler.dto;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;

@Value
@Builder
public class SchedulerRunReport {

    String schedulerName;
    Instant startedAt;
    Instant finishedAt;
    int totalProcessed;
    int successCount;
    int failureCount;
    int skippedCount;
    List<ReminderResult> results;

    public long durationMs() {
        return finishedAt.toEpochMilli() - startedAt.toEpochMilli();
    }

    public String summary() {
        return String.format(
                "[%s] Run complete \u2014 total=%d sent=%d failed=%d skipped=%d duration=%dms",
                schedulerName, totalProcessed, successCount, failureCount, skippedCount, durationMs());
    }
}
