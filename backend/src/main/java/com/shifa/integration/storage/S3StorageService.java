package com.shifa.integration.storage;

import org.springframework.stereotype.Service;

@Service
public class S3StorageService {

    public String upload(byte[] file, String key) {
        return key;
    }
}
