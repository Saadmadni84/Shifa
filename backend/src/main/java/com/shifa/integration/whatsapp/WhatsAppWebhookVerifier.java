package com.shifa.integration.whatsapp;

import com.shifa.integration.whatsapp.config.WhatsAppProperties;
import lombok.RequiredArgsConstructor;
import org.bouncycastle.util.encoders.Hex;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Component
@RequiredArgsConstructor
public class WhatsAppWebhookVerifier {

    private final WhatsAppProperties props;

    public boolean isValidSignature(String payload, String header) {
        if (header == null || !header.startsWith("sha256=")) return false;
        try {
            String expected = header.substring(7);
            SecretKeySpec key = new SecretKeySpec(
                props.getToken().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(key);
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String computed = Hex.toHexString(hash);
            return MessageDigest.isEqual(
                Hex.decode(expected), Hex.decode(computed));
        } catch (Exception e) { return false; }
    }
}
