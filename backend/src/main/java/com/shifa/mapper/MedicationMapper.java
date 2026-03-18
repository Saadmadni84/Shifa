package com.shifa.mapper;

import com.shifa.dto.MedicationDTO;
import com.shifa.entity.Medication;

public class MedicationMapper {

    public static MedicationDTO toDTO(Medication m) {
        if (m == null) {
            return null;
        }
        MedicationDTO dto = new MedicationDTO();
        dto.setId(m.getId());
        dto.setGenericName(m.getGenericName());
        dto.setDisplayName(m.getDisplayName());
        dto.setForm(m.getForm());
        dto.setStrengthValue(m.getStrengthValue());
        dto.setStrengthUnit(m.getStrengthUnit());
        return dto;
    }
}
