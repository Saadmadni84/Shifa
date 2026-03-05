package com.shifa.integration.whatsapp;

import com.shifa.common.enums.Language;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class WhatsAppMessageFormatter {

    private final String baseUrl;

    public WhatsAppMessageFormatter(
            @Value("${app.base-url:https://shifa.health}") String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String buildVisitSummaryMessage(String summaryText, String portalToken,
                                            Language lang, String patientFirstName) {
        String url    = baseUrl + "/visit/" + portalToken;
        String header = buildHeader(lang, patientFirstName);
        String footer = buildFooter(lang, url);
        int maxBody   = 3500 - header.length() - footer.length();
        String body   = summaryText.length() > maxBody
            ? summaryText.substring(0, maxBody) + "\n..." : summaryText;
        return header + body + footer;
    }

    public String buildOtpMessage(String otp, Language lang) {
        return switch (lang) {
            case HI -> "🔐 *Shifa OTP*\n\nआपका OTP: *" + otp + "*\n5 मिनट में expire। किसी को न बताएं।";
            case TA -> "🔐 *Shifa OTP*\n\nOTP: *" + otp + "*\n5 நிமிடம் செல்லுபடியாகும்।";
            case TE -> "🔐 *Shifa OTP*\n\nOTP: *" + otp + "*\n5 నిమిషాల వరకు చెల్లుతుంది।";
            case BN -> "🔐 *Shifa OTP*\n\nOTP: *" + otp + "*\n৫ মিনিটের মধ্যে মেয়াদ শেষ।";
            case MR -> "🔐 *Shifa OTP*\n\nOTP: *" + otp + "*\n5 मिनिटांत expire होईल।";
            case GU -> "🔐 *Shifa OTP*\n\nOTP: *" + otp + "*\n5 મિનિટમાં expire।";
            case KN -> "🔐 *Shifa OTP*\n\nOTP: *" + otp + "*\n5 ನಿಮಿಷಗಳಲ್ಲಿ ಮಾನ್ಯತೆ ಮೀರುತ್ತದೆ।";
            case ML -> "🔐 *Shifa OTP*\n\nOTP: *" + otp + "*\n5 മിനിറ്റിൽ കാലഹരണപ്പെടും।";
            default  -> "🔐 *Shifa OTP*\n\nYour OTP: *" + otp + "*\nValid 5 min. Never share.";
        };
    }

    public String buildMedicationReminder(String medName, String timing,
                                           String dosage, Language lang) {
        return switch (lang) {
            case HI -> "💊 *दवाई का समय - Shifa*\n\n" + timing + " की दवाई: *" + medName + "* (" + dosage + ")\n_डॉक्टर की सलाह से लें_ 🙏";
            case TA -> "💊 *மருந்து நேரம் - Shifa*\n\n" + medName + " (" + dosage + ") எடுக்க நேரமாயிற்று 🙏";
            default  -> "💊 *Medication Reminder - Shifa*\n\nTime for *" + medName + "* (" + dosage + ") — " + timing + " 🙏";
        };
    }

    private String buildHeader(Language lang, String name) {
        return switch (lang) {
            case HI -> "🩺 *" + name + " जी, आपकी डॉक्टर विज़िट का सारांश - Shifa*\n\n";
            case TA -> "🩺 *" + name + ", உங்கள் மருத்துவர் வருகை சுருக்கம் - Shifa*\n\n";
            case TE -> "🩺 *" + name + ", మీ డాక్టర్ విజిట్ సారాంశం - Shifa*\n\n";
            case BN -> "🩺 *" + name + ", আপনার ডাক্তার ভিজিটের সারসংক্ষেপ - Shifa*\n\n";
            case MR -> "🩺 *" + name + ", तुमच्या डॉक्टर भेटीचा सारांश - Shifa*\n\n";
            case GU -> "🩺 *" + name + ", તમારી ડૉક્ટર મુલાકાતનો સારાંશ - Shifa*\n\n";
            case KN -> "🩺 *" + name + ", ನಿಮ್ಮ ಡಾಕ್ಟರ್ ಭೇಟಿಯ ಸಾರಾಂಶ - Shifa*\n\n";
            case ML -> "🩺 *" + name + ", നിങ്ങളുടെ ഡോക്ടർ സന്ദർശന സംഗ്രഹം - Shifa*\n\n";
            default  -> "🩺 *" + name + ", Your Doctor Visit Summary - Shifa*\n\n";
        };
    }

    private String buildFooter(Language lang, String url) {
        return switch (lang) {
            case HI -> "\n\n📱 *पूरी जानकारी:*\n" + url + "\n\n⏰ _30 दिन valid_ | 💚 _Shifa - आपकी स्वास्थ्य साथी_";
            case TA -> "\n\n📱 *முழு விவரங்கள்:*\n" + url + "\n\n⏰ _30 நாட்கள்_ | 💚 _Shifa_";
            default  -> "\n\n📱 *Full details & questions:*\n" + url + "\n\n⏰ _Valid 30 days_ | 💚 _Shifa - Your Health Companion_";
        };
    }
}
