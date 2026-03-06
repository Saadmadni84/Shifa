package com.shifa.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "aws")
public class AwsProperties {
    private String region = "ap-south-1";
    private S3 s3 = new S3();

    @Data
    public static class S3 {
        private String bucket = "shifa-health-records";
    }
}
