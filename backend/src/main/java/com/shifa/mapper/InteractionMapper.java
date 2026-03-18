package com.shifa.mapper;

import org.springframework.stereotype.Component;

import com.shifa.dto.InteractionDTO;
import com.shifa.entity.MedicationInteraction;

@Component
public class InteractionMapper {
    public static InteractionDTO toDto(MedicationInteraction entity) {
        if (entity == null) {
            return new InteractionDTO(false, "safe", "No known interactions.", null);
        }
        return new InteractionDTO(
                true,
                entity.getSeverity(),
                entity.getDescription(),
                entity.getManagement()
        );
    }
}
