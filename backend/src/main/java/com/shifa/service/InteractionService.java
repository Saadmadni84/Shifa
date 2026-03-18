package com.shifa.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.shifa.dto.InteractionResultDTO;
import com.shifa.dto.InteractionSummaryDTO;
import com.shifa.entity.Medication;
import com.shifa.entity.MedicationInteraction;
import com.shifa.enums.SeverityLevel;
import com.shifa.repository.MedicationInteractionRepository;
import com.shifa.repository.MedicationRepository;

@Service
public class InteractionService {

    private final MedicationInteractionRepository repo;
    private final MedicationRepository medicationRepository;

    public InteractionService(MedicationInteractionRepository repo, MedicationRepository medicationRepository) {
        this.repo = repo;
        this.medicationRepository = medicationRepository;
    }

    public MedicationInteraction checkInteraction(UUID drugA, UUID drugB) {
        return repo.findByDrugAIdAndDrugBId(drugA, drugB)
                .or(() -> repo.findByDrugAIdAndDrugBId(drugB, drugA))
                .orElse(null);
    }

    public List<InteractionResultDTO> checkMultiple(List<UUID> drugs) {
        List<InteractionResultDTO> results = new ArrayList<>();

        if (drugs == null || drugs.size() < 2) {
            return results;
        }

        for (int i = 0; i < drugs.size(); i++) {
            for (int j = i + 1; j < drugs.size(); j++) {
                UUID drugA = drugs.get(i);
                UUID drugB = drugs.get(j);

                MedicationInteraction interaction = checkInteraction(drugA, drugB);

                if (interaction != null) {
                    InteractionResultDTO dto = new InteractionResultDTO();
                    dto.setDrugA(drugA);
                    dto.setDrugB(drugB);
                    dto.setSeverity(interaction.getSeverity());
                    dto.setMessage(interaction.getDescription());

                    results.add(dto);
                }
            }
        }

        return results;
    }

    public List<InteractionResultDTO> checkMultipleOptimized(List<UUID> drugs) {
        List<InteractionResultDTO> results = new ArrayList<>();

        if (drugs == null || drugs.size() < 2) {
            return results;
        }

        Map<UUID, String> nameMap = medicationRepository
                .findAllById(drugs)
                .stream()
                .collect(Collectors.toMap(
                        Medication::getId,
                        Medication::getDisplayName
                ));

        List<MedicationInteraction> interactions = repo.findAllInteractionsBetweenDrugs(drugs);

        Map<String, MedicationInteraction> map = new HashMap<>();

        for (MedicationInteraction mi : interactions) {
            String key1 = mi.getDrugAId() + "_" + mi.getDrugBId();
            String key2 = mi.getDrugBId() + "_" + mi.getDrugAId();

            map.put(key1, mi);
            map.put(key2, mi);
        }

        for (int i = 0; i < drugs.size(); i++) {
            for (int j = i + 1; j < drugs.size(); j++) {
                UUID a = drugs.get(i);
                UUID b = drugs.get(j);

                MedicationInteraction mi = map.get(a + "_" + b);

                if (mi != null) {
                    InteractionResultDTO dto = new InteractionResultDTO();
                    dto.setDrugA(a);
                    dto.setDrugB(b);
                    dto.setDrugAName(nameMap.get(a));
                    dto.setDrugBName(nameMap.get(b));
                    dto.setSeverity(mi.getSeverity());
                    dto.setMessage(mi.getDescription());

                    results.add(dto);
                }
            }
        }

        results.sort((a, b) -> 
            SeverityLevel.fromString(b.getSeverity()).getWeight() -
            SeverityLevel.fromString(a.getSeverity()).getWeight()
        );

        return results;
    }

    public InteractionSummaryDTO summarize(List<InteractionResultDTO> results) {
        SeverityLevel max = SeverityLevel.SAFE;

        for (InteractionResultDTO r : results) {
            SeverityLevel current = SeverityLevel.fromString(r.getSeverity());
            if (current.getWeight() > max.getWeight()) {
                max = current;
            }
        }

        InteractionSummaryDTO summary = new InteractionSummaryDTO();
        summary.setOverallSeverity(max.name());
        summary.setInteractions(results);

        // Recommendation logic
        summary.setRecommendation(getRecommendation(max));

        return summary;
    }

    private String getRecommendation(SeverityLevel level) {
        return switch (level) {
            case CRITICAL -> "Avoid combination. Immediate medical attention required.";
            case MAJOR -> "Avoid unless absolutely necessary.";
            case MODERATE -> "Use with caution and monitor.";
            case LOW -> "Minimal risk.";
            default -> "Safe to use.";
        };
    }
}



