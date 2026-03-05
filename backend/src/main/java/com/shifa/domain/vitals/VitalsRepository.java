package com.shifa.domain.vitals;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VitalsRepository extends JpaRepository<VitalSigns, UUID> {
    Optional<VitalSigns> findByVisitId(UUID visitId);
}
