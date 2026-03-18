package com.shifa.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shifa.dto.InteractionDTO;
import com.shifa.dto.InteractionRequestDTO;
import com.shifa.dto.InteractionResultDTO;
import com.shifa.dto.InteractionSummaryDTO;
import com.shifa.mapper.InteractionMapper;
import com.shifa.service.InteractionService;

@RestController
@RequestMapping("/interactions")
public class InteractionController {

    private final InteractionService interactionService;

    public InteractionController(InteractionService interactionService) {
        this.interactionService = interactionService;
    }

    @GetMapping
    public InteractionDTO check(@RequestParam UUID drug1, @RequestParam UUID drug2) {
        var entity = interactionService.checkInteraction(drug1, drug2);
        return InteractionMapper.toDto(entity);
    }

    @PostMapping("/check-multiple")
    public List<InteractionResultDTO> checkMultiple(@RequestBody InteractionRequestDTO request) {
        return interactionService.checkMultiple(request.getDrugIds());
    }

    @PostMapping("/check-multiple-optimized")
    public List<InteractionResultDTO> checkMultipleOptimized(@RequestBody InteractionRequestDTO request) {
        return interactionService.checkMultipleOptimized(request.getDrugIds());
    }

    @PostMapping("/check-multiple-advanced")
    public InteractionSummaryDTO checkAdvanced(@RequestBody InteractionRequestDTO request) {
        List<InteractionResultDTO> results = interactionService.checkMultipleOptimized(request.getDrugIds());
        return interactionService.summarize(results);
    }
}



