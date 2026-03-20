package com.shifa.demo;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DemoController {

    private final DemoService demoService;

    @GetMapping("/scenarios")
    public List<ScenarioDTO> getScenarios() {
        return demoService.getScenarios().stream()
            .map(ScenarioDTO::new)
            .collect(Collectors.toList());
    }

    @GetMapping("/scenarios/{id}")
    public DemoPatientResponse getScenario(@PathVariable UUID id) {
        return demoService.getScenario(id);
    }
}