package com.shifa.domain.document;

import org.springframework.data.keyvalue.repository.KeyValueRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentRepository extends KeyValueRepository<UploadedDocument, String> {
    List<UploadedDocument> findByVisitId(UUID visitId);
    List<UploadedDocument> findByPatientId(UUID patientId);
    long countByVisitId(UUID visitId);

    default Optional<UploadedDocument> findById(UUID id) {
        return id == null ? Optional.empty() : findById(id.toString());
    }

    default void deleteById(UUID id) {
        if (id != null) {
            deleteById(id.toString());
        }
    }

}
