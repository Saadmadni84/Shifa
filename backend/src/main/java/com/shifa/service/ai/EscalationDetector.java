package com.shifa.service.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.regex.Pattern;

@Component
@Slf4j
public class EscalationDetector {

    private static final Set<String> EMERGENCY_KEYWORDS = Set.of(
            "chest pain", "heart attack", "can't breathe", "cannot breathe",
            "difficulty breathing", "unconscious", "fainted", "seizure", "convulsion",
            "stroke", "paralysis", "sudden weakness", "severe bleeding", "blood vomiting",
            "high fever 104", "high fever 105",
            "seene mein dard", "saans nahi", "sans nahi", "behosh", "chakkar",
            "haath sunn", "muh tera", "neel par gaya", "khoon aa raha",
            "bahut tez bukhaar", "pet mein bahut dard",
            "maarbu vali", "maraippu",
            "108", "emergency", "ambulance", "icu", "intensive care");

    private static final Pattern KEYWORD_PATTERN;

    static {
        String combined = EMERGENCY_KEYWORDS.stream()
                .map(Pattern::quote)
                .reduce((a, b) -> a + "|" + b)
                .orElse("(?!x)x");
        KEYWORD_PATTERN = Pattern.compile(combined, Pattern.CASE_INSENSITIVE);
    }

    public EscalationResult check(String question, String languageCode) {
        if (KEYWORD_PATTERN.matcher(question).find()) {
            log.warn("[EscalationDetector] Emergency keyword detected in patient question");
            return EscalationResult.emergency(getEmergencyMessage(languageCode));
        }
        return EscalationResult.safe();
    }

    private String getEmergencyMessage(String lang) {
        return switch (lang) {
            case "hi" ->
                "⚠️ यह एक गंभीर स्थिति हो सकती है। कृपया तुरंत 108 पर call करें या नजदीकी अस्पताल जाएं। देरी न करें।";
            case "ta" -> "⚠️ இது தீவிரமான நிலை. உடனே 108 அழைக்கவும் அல்லது அருகிலுள்ள மருத்துவமனைக்கு செல்லவும்.";
            case "te" -> "⚠️ ఇది తీవ్రమైన పరిస్థితి. వెంటనే 108 కి కాల్ చేయండి లేదా దగ్గరలోని ఆసుపత్రికి వెళ్ళండి.";
            case "bn" -> "⚠️ এটি একটি গুরুতর পরিস্থিতি। অবিলম্বে 108 নম্বরে কল করুন বা নিকটস্থ হাসপাতালে যান।";
            default ->
                "⚠️ This may be a serious emergency. Please call 108 immediately or go to the nearest hospital. Do not delay.";
        };
    }

    public record EscalationResult(boolean isEmergency, String emergencyMessage) {
        public static EscalationResult emergency(String msg) {
            return new EscalationResult(true, msg);
        }

        public static EscalationResult safe() {
            return new EscalationResult(false, null);
        }
    }
}
