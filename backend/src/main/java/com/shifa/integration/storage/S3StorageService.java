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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
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

        if (props.isLocalMode()) {
            Path target = localPath(key);
            Files.createDirectories(target.getParent());
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            log.info("[LOCAL STORAGE] Uploaded. key={}, size={}", key, file.getSize());
            return key;
        }

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
        if (props.isLocalMode()) {
            return "/api/documents/local-download?key=" + java.net.URLEncoder.encode(key, java.nio.charset.StandardCharsets.UTF_8);
        }
        var req = GetObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(props.getPresignedUrlExpiryMinutes()))
            .getObjectRequest(r -> r.bucket(props.getBucket()).key(key))
            .build();
        return s3Presigner.presignGetObject(req).url().toString();
    }

    public byte[] downloadFile(String key) {
        if (props.isLocalMode()) {
            try {
                return Files.readAllBytes(localPath(key));
            } catch (IOException e) {
                throw new IllegalStateException("Stored file not found", e);
            }
        }
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

    public void deleteFile(String key) {
        if (key == null || key.isBlank()) return;
        if (props.isLocalMode()) {
            try {
                Files.deleteIfExists(localPath(key));
            } catch (IOException e) {
                log.warn("[LOCAL STORAGE] Failed to delete key={}", key, e);
            }
            return;
        }
        s3Client.deleteObject(r -> r.bucket(props.getBucket()).key(key));
        log.info("[S3] Deleted unpersisted upload. key={}", key);
    }

    public boolean exists(String key) {
        if (props.isLocalMode()) return Files.exists(localPath(key));
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

    private Path localPath(String key) {
        Path root = Path.of(props.getLocalRoot()).toAbsolutePath().normalize();
        Path target = root.resolve(key).normalize();
        if (!target.startsWith(root)) throw new IllegalArgumentException("Invalid storage key");
        return target;
    }
}
