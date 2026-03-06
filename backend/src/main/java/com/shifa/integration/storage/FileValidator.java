package com.shifa.integration.storage;

import com.shifa.integration.storage.config.S3Properties;
import com.shifa.integration.storage.exception.InvalidFileException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class FileValidator {

    private final S3Properties props;

    private static final Set<String> ALLOWED_MIMES = Set.of(
        "image/jpeg", "image/png", "image/webp", "application/pdf"
    );

    private static final Map<String, byte[]> MAGIC = Map.of(
        "image/jpeg",      new byte[]{(byte)0xFF,(byte)0xD8,(byte)0xFF},
        "image/png",       new byte[]{(byte)0x89,0x50,0x4E,0x47},
        "application/pdf", new byte[]{0x25,0x50,0x44,0x46} // %PDF
    );

    public void validate(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty())
            throw new InvalidFileException("File is empty");

        if (file.getSize() > props.getMaxFileSizeBytes())
            throw new InvalidFileException(
                "File too large: " + file.getSize() + " bytes. Max: " + props.getMaxFileSizeBytes());

        if (file.getContentType() == null || !ALLOWED_MIMES.contains(file.getContentType()))
            throw new InvalidFileException("File type not allowed: " + file.getContentType());

        byte[] header = file.getBytes();
        byte[] magic  = MAGIC.get(file.getContentType());
        if (magic != null) {
            for (int i = 0; i < magic.length; i++) {
                if (i >= header.length || header[i] != magic[i])
                    throw new InvalidFileException("File content does not match declared MIME type");
            }
        }
    }
}
