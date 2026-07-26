package com.shifa.domain.vitals;

import com.shifa.domain.vitals.dto.VitalsRequest;
import com.shifa.domain.vitals.dto.VitalsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class VitalsService {

    public VitalsResponse recordVitals(UUID visitId, VitalsRequest request) {
        return null; // TODO implement
    }

    public VitalsResponse getVitals(UUID visitId) {
        return null; // TODO implement
    }
}
