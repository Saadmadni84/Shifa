package com.shifa.domain.vitals.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VitalsResponse {

    String id;
    String visitId;
    LocalDate visitDate;

    Integer bpSystolic;
    Integer bpDiastolic;
    String bloodPressure;
    Integer pulseRate;
    BigDecimal temperature;
    Integer respiratoryRate;
    Integer spo2;
    BigDecimal weightKg;
    BigDecimal heightCm;
    BigDecimal bmi;
    String bmiCategory;
    BigDecimal bloodSugarFasting;
    BigDecimal bloodSugarRandom;
    String notes;

    boolean bpAbnormal;
    boolean tempAbnormal;
    boolean spo2Abnormal;
    boolean pulseAbnormal;
    boolean bmiAbnormal;

    List<String> abnormalFindings;

    LocalDateTime recordedAt;
}
