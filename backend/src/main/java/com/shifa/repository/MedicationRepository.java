package com.shifa.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.shifa.entity.Medication;

public interface MedicationRepository extends JpaRepository<Medication, UUID> {

    @Query("SELECT m FROM MedicationCatalog m WHERE LOWER(m.displayName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.genericName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Medication> searchByQuery(@Param("query") String query);
}
// trigger rebuild
