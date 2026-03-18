package com.shifa.dto;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.Data;

@Data
public class MedicationDTO {
    private UUID id;
    private String genericName;
    private String displayName;
    private String form;
    private BigDecimal strengthValue;
    private String strengthUnit;
}
