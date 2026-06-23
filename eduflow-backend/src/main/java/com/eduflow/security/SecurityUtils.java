package com.eduflow.security;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class SecurityUtils {

    private static final String SECRET = "EduFlowSecureQRSecretKeyChangeEveryTenSeconds";

    public static String generateOTP(Long sessionId, long timeInterval) {
        try {
            String message = sessionId + ":" + timeInterval;
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secretKey);
            byte[] hash = sha256_HMAC.doFinal(message.getBytes(StandardCharsets.UTF_8));
            // Return an 8-character url-safe string
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash).substring(0, 8);
        } catch (Exception e) {
            return "error";
        }
    }
}
