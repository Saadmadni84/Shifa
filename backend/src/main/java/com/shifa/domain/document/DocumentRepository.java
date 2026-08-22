package com.shifa.domain.document;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<UploadedDocument, UUID> {
    List<UploadedDocument> findByVisitId(UUID visitId);
    List<UploadedDocument> findByPatientId(UUID patientId);
    long countByVisitId(UUID visitId);
    Optional<UploadedDocument> findByS3Key(String s3Key);

}
