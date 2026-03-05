package com.shifa.config;

import com.shifa.config.properties.AwsProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.ses.SesClient;

/**
 * AWS SDK v2 client beans for Shifa.
 *
 * Services wired here:
 *   S3Client    — prescription / lab-report uploads  (Mumbai bucket)
 *   S3Presigner — 1-hour signed URLs for patient file access
 *   SesClient   — transactional email (registration, OTP fallback)
 *
 * Credential resolution — DefaultCredentialsProvider chain:
 *   1. AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY env vars   → local dev
 *   2. ~/.aws/credentials profile                           → local dev
 *   3. ECS task IAM role                                    → PRODUCTION
 *      (credentials auto-rotated by AWS — zero secrets in code)
 *
 * Region: ap-south-1 (Mumbai) — MANDATORY for DPDP Act 2023 compliance.
 * All patient health data must be stored within India.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class AwsConfig {

    private final AwsProperties awsProperties;

    /**
     * S3 client for upload / download / delete operations.
     * Used by: S3StorageService
     */
    @Bean
    public S3Client s3Client() {
        S3Client client = S3Client.builder()
            .region(Region.of(awsProperties.getRegion()))
            .credentialsProvider(DefaultCredentialsProvider.create())
            .build();

        log.info("S3Client ready | region={} | bucket={}",
            awsProperties.getRegion(),
            awsProperties.getS3().getBucket());

        return client;
    }

    /**
     * S3Presigner — generates time-limited signed download URLs.
     * Kept separate from S3Client; presigning is a lightweight signing op.
     * Used by: S3StorageService.generatePresignedUrl()
     */
    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
            .region(Region.of(awsProperties.getRegion()))
            .credentialsProvider(DefaultCredentialsProvider.create())
            .build();
    }

    /**
     * SES client for transactional emails.
     * Use cases:
     *   • Doctor registration confirmation
     *   • Password reset link
     *   • OTP delivery fallback (if WhatsApp fails)
     *   • Weekly visit summary digest (future)
     *
     * Requires SES sandbox exit + verified sender domain for production.
     */
    @Bean
    public SesClient sesClient() {
        return SesClient.builder()
            .region(Region.of(awsProperties.getRegion()))
            .credentialsProvider(DefaultCredentialsProvider.create())
            .build();
    }
}
