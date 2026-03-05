package com.shifa.domain.doctor.dto;

import com.shifa.domain.visit.dto.VisitListResponse;
import lombok.Builder;
import lombok.Value;

import java.util.List;
import java.util.Map;

@Value
@Builder
public class DoctorStatsResponse {

    int visitsToday;
    int patientsToday;

    int visitsThisWeek;
    int patientsThisWeek;

    long totalVisits;
    long totalPatients;

    long summariesSent;
    long summariesDelivered;
    long summariesRead;

    long aiSummariesGenerated;
    double avgAiProcessingSeconds;

    Map<String, Long> patientLanguageBreakdown;

    List<VisitListResponse> recentVisits;
}
