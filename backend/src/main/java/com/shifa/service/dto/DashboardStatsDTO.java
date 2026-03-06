package com.shifa.service.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DashboardStatsDTO {

    int todayVisits;
    int todayFollowUps;

    int monthVisits;
    int monthNewPatients;

    int pendingAiProcessing;
    int pendingSendToPatient;
    int failedNotifications;

    int totalPatients;
    int totalVisits;

    double whatsappReadRate;
    String topLanguage;
}
