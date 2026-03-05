package com.shifa.integration.storage.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@ConfigurationProperties(prefix = "integration.s3")
@Data
@Validated
public class S3Properties {
    @NotBlank private String bucket;
    @NotBlank private String region;
    private int presignedUrlExpiryMinutes = 60;
    private long maxFileSizeBytes = 10485760;
    private List<String> allowedMimeTypes;
}
