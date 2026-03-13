// DashboardResponseDto
// backend/src/main/java/com/shifa/dto/DashboardResponseDto.java
package com.shifa.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data @Builder
public class DashboardResponseDto {
    private DoctorDto doctor;
    private StatsDto stats;
    private List<AlertDto> alerts;
    private List<PatientSummaryDto> recentPatients;

    @Data @Builder
    public static class StatsDto {
        private int totalPatients;
        private int unreadMessages;
        private int totalVisits;
        private int alertPatients;
    }

    @Data @Builder
    public static class AlertDto {
        private String patientId;
        private String patientName;
        private String type;
        private String detail;
        private String date;
        private String avatar;
    }
}
