package com.shifa.dto;

import java.util.UUID;

public class InteractionResultDTO {
    private UUID drugA;
    private UUID drugB;
    
    private String drugAName;
    private String drugBName;
    
    private String severity;
    private String message;

    public UUID getDrugA() {
        return drugA;
    }

    public void setDrugA(UUID drugA) {
        this.drugA = drugA;
    }

    public UUID getDrugB() {
        return drugB;
    }

    public void setDrugB(UUID drugB) {
        this.drugB = drugB;
    }

    public String getDrugAName() {
        return drugAName;
    }

    public void setDrugAName(String drugAName) {
        this.drugAName = drugAName;
    }

    public String getDrugBName() {
        return drugBName;
    }

    public void setDrugBName(String drugBName) {
        this.drugBName = drugBName;
    }

    public String getSeverity() {
        return severity;
    }


    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
