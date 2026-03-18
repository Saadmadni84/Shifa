package com.shifa.dto;

import java.util.List;
import java.util.UUID;

public class InteractionRequestDTO {
    private List<UUID> drugIds;

    public List<UUID> getDrugIds() {
        return drugIds;
    }

    public void setDrugIds(List<UUID> drugIds) {
        this.drugIds = drugIds;
    }
}
