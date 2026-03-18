package com.shifa.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.shifa.dto.MedicationDTO;
import com.shifa.mapper.MedicationMapper;
import com.shifa.repository.MedicationRepository;

@Service
public class MedicationService {

    private final MedicationRepository repo;

    public MedicationService(MedicationRepository repo) {
        this.repo = repo;
    }

    public List<MedicationDTO> getAll() {
        return repo.findAll().stream()
                .map(MedicationMapper::toDTO)
                .collect(Collectors.toList());
    }

    public MedicationDTO getById(UUID id) {
        return MedicationMapper.toDTO(repo.findById(id).orElseThrow());
    }

    public List<MedicationDTO> search(String query) {
        return repo.searchByQuery(query).stream()
                .map(MedicationMapper::toDTO)
                .collect(Collectors.toList());
    }
}
