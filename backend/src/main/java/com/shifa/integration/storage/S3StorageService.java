package com.shifa.integration.storage;

import com.shifa.integration.storage.config.S3Properties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class S3StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final S3Properties props;
    private final FileValidator fileValidator;

    public String uploadFile(MultipartFile file, String folder, UUID patientId)
            throws IOException {
        fileValidator.validate(file);
        String key = buildKey(folder, patientId, file.getOriginalFilename());

        s3Client.putObject(
            PutObjectRequest.builder()
                .bucket(props.getBucket()).key(key)
                .contentType(file.getContentType())
                .contentLength(file.getSize())
                .serverSideEncryption(ServerSideEncryption.AES256)
                .metadata(Map.of(
                    "original-filename", sanitize(file.getOriginalFilename()),
                    "patient-id", patientId.toString(),
                    "upload-ts", Instant.now().toString()
                ))
                .build(),
            RequestBody.fromInputStream(file.getInputStream(), file.getSize())
        );

        log.info("[S3] Uploaded. bucket={}, key={}, size={}", props.getBucket(), key, file.getSize());
        return key;
    }

    public String generatePresignedUrl(String key) {
        var req = GetObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(props.getPresignedUrlExpiryMinutes()))
            .getObjectRequest(r -> r.bucket(props.getBucket()).key(key))
            .build();
        return s3Presigner.presignGetObject(req).url().toString();
    }

    public byte[] downloadFile(String key) {
        return s3Client.getObjectAsBytes(
            r -> r.bucket(props.getBucket()).key(key)
        ).asByteArray();
    }

    public void softDelete(String key) {
        String dest = "deleted/" + key;
        s3Client.copyObject(r -> r
            .sourceBucket(props.getBucket()).sourceKey(key)
            .destinationBucket(props.getBucket()).destinationKey(dest));
        s3Client.deleteObject(r -> r.bucket(props.getBucket()).key(key));
        log.info("[S3] Soft-deleted. key={}, movedTo={}", key, dest);
    }

    public boolean exists(String key) {
        try {
            s3Client.headObject(r -> r.bucket(props.getBucket()).key(key));
            return true;
        } catch (NoSuchKeyException e) { return false; }
    }

    private String buildKey(String folder, UUID patientId, String filename) {
        String ext = getExt(filename);
        return String.format("%s/%s/%s%s", folder, patientId, UUID.randomUUID(), ext);
    }

    private String sanitize(String name) {
        return name != null ? name.replaceAll("[^a-zA-Z0-9._-]", "_") : "unknown";
    }

    private String getExt(String name) {
        if (name == null) return "";
        int dot = name.lastIndexOf('.');
        return dot >= 0 ? name.substring(dot).toLowerCase() : "";
    }
}
