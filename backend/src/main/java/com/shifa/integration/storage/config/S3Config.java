package com.shifa.integration.storage.config;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

// Disabled — duplicate of com.shifa.config.AwsConfig (s3Client, s3Presigner)
// @Configuration
@RequiredArgsConstructor
public class S3Config {

    private final S3Properties props;

    // @Bean
    public S3Client s3Client() {
        return S3Client.builder()
            .region(Region.of(props.getRegion()))
            .credentialsProvider(DefaultCredentialsProvider.create())
            .build();
    }

    // @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
            .region(Region.of(props.getRegion()))
            .credentialsProvider(DefaultCredentialsProvider.create())
            .build();
    }
}
