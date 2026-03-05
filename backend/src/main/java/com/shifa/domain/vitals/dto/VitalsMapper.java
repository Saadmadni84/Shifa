package com.shifa.domain.vitals.dto;

import com.shifa.common.mapper.GlobalMapperConfig;
import com.shifa.domain.vitals.VitalSigns;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(config = GlobalMapperConfig.class)
public interface VitalsMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "visit", ignore = true)
    @Mapping(target = "bmi", ignore = true) // Handled by @PrePersist
    VitalSigns toEntity(VitalsRequest request);

    @Mapping(target = "visitId", source = "visit.id")
    @Mapping(target = "visitDate", source = "visit.visitDate")
    @Mapping(target = "bloodPressure", expression = "java(vitalSigns.getBpSystolic() != null && vitalSigns.getBpDiastolic() != null ? vitalSigns.getBpSystolic() + \"/\" + vitalSigns.getBpDiastolic() + \" mmHg\" : null)")
    @Mapping(target = "bmiCategory", source = "vitalSigns", qualifiedByName = "calculateBmiCategory")
    @Mapping(target = "bpAbnormal", expression = "java(vitalSigns.getBpSystolic() != null && (vitalSigns.getBpSystolic() > 140 || vitalSigns.getBpSystolic() < 90))")
    @Mapping(target = "tempAbnormal", expression = "java(vitalSigns.getTemperature() != null && vitalSigns.getTemperature().compareTo(new java.math.BigDecimal(\"37.5\")) > 0)")
    @Mapping(target = "spo2Abnormal", expression = "java(vitalSigns.getSpo2() != null && vitalSigns.getSpo2() < 95)")
    @Mapping(target = "pulseAbnormal", expression = "java(vitalSigns.getPulseRate() != null && (vitalSigns.getPulseRate() > 100 || vitalSigns.getPulseRate() < 60))")
    @Mapping(target = "bmiAbnormal", expression = "java(vitalSigns.getBmi() != null && (vitalSigns.getBmi().compareTo(new java.math.BigDecimal(\"25\")) >= 0 || vitalSigns.getBmi().compareTo(new java.math.BigDecimal(\"18.5\")) < 0))")
    @Mapping(target = "abnormalFindings", expression = "java(vitalSigns.getAbnormalFindings())")
    @Mapping(target = "recordedAt", source = "createdAt")
    VitalsResponse toResponse(VitalSigns vitalSigns);

    @Named("calculateBmiCategory")
    default String calculateBmiCategory(VitalSigns vitalSigns) {
        if (vitalSigns.getBmi() == null) return null;
        double bmi = vitalSigns.getBmi().doubleValue();
        if (bmi < 18.5) return "Underweight";
        if (bmi < 25) return "Normal";
        if (bmi < 30) return "Overweight";
        return "Obese";
    }
}
