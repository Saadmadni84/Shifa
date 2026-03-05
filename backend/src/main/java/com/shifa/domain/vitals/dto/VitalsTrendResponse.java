package com.shifa.domain.vitals.dto;

import lombok.Builder;
import lombok.Value;
import java.time.LocalDate;
import java.util.List;

@Value
@Builder
public class VitalsTrendResponse {

    String patientId;
    String patientName;
    List<VitalDataPoint> bpTrend;
    List<VitalDataPoint> pulseTrend;
    List<VitalDataPoint> weightTrend;
    List<VitalDataPoint> bloodSugarTrend;
    List<VitalDataPoint> temperatureTrend;

    @Value @Builder
    public static class VitalDataPoint {
        LocalDate date;
        Double value;
        String label;
        boolean abnormal;
    }
}
