package com.shifa.service.document;

import com.shifa.domain.visit.Visit;
import com.shifa.domain.visit.VisitRepository;
import com.shifa.service.exception.DocumentNotFoundException;
import com.shifa.service.exception.VisitNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final VisitRepository visitRepository;

    @Transactional
    public String uploadDocument(Long visitId, MultipartFile file, UUID doctorId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new VisitNotFoundException(visitId));

        if (!visit.getDoctor().getUser().getId().equals(doctorId)) {
            throw new org.springframework.security.access.AccessDeniedException("Access Denied");
        }

        String fileUrl = "s3://shifa-bucket/visits/" + visitId + "/" + file.getOriginalFilename();

        log.info("[DocumentService] Uploaded document to S3: {}", fileUrl);

        visit.setUpdatedAt(LocalDateTime.now());
        visitRepository.save(visit);

        return fileUrl;
    }

    @Transactional
    public void deleteDocument(Long visitId, String documentId, UUID doctorId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new VisitNotFoundException(visitId));

        if (!visit.getDoctor().getUser().getId().equals(doctorId)) {
            throw new org.springframework.security.access.AccessDeniedException("Access Denied");
        }

        log.info("[DocumentService] Deleted document from S3: {}", documentId);

        visit.setUpdatedAt(LocalDateTime.now());
        visitRepository.save(visit);
    }
}
