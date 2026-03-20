package com.shifa.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shifa.dto.MedicationDTO;
import com.shifa.service.MedicationService;

@RestController
@RequestMapping("/api/medications")
public class MedicationController {

    private final MedicationService service;

    public MedicationController(MedicationService service) {
        this.service = service;
    }

    @GetMapping
    public List<MedicationDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/search")
    public List<MedicationDTO> search(@RequestParam(value = "q", required = false) String q,
                                      @RequestParam(value = "name", required = false) String name) {
        String query = q != null ? q : name;
        if (query == null) {
            return List.of();
        }
        return service.search(query);
    }

    @GetMapping("/{id}")
    public MedicationDTO getById(@PathVariable UUID id) {
        return service.getById(id);
    }
}
