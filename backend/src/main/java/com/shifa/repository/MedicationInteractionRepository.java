package com.shifa.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.shifa.entity.MedicationInteraction;

@Repository
public interface MedicationInteractionRepository extends JpaRepository<MedicationInteraction, UUID> {

    Optional<MedicationInteraction> findByDrugAIdAndDrugBId(UUID drugAId, UUID drugBId);

    Optional<MedicationInteraction> findByDrugBIdAndDrugAId(UUID drugBId, UUID drugAId);

    @Query("""
        SELECT mi FROM MedicationInteraction mi
        WHERE (mi.drugAId IN :drugIds AND mi.drugBId IN :drugIds)
    """)
    List<MedicationInteraction> findAllInteractionsBetweenDrugs(@Param("drugIds") List<UUID> drugIds);
}

