package com.shifa.enums;

public enum SeverityLevel {
    SAFE(0),
    LOW(1),
    MODERATE(2),
    MAJOR(3),
    CRITICAL(4);

    private final int weight;

    SeverityLevel(int weight) {
        this.weight = weight;
    }

    public int getWeight() {
        return weight;
    }

    public static SeverityLevel fromString(String value) {
        if (value == null) return SAFE;
        return switch (value.toLowerCase()) {
            case "low" -> LOW;
            case "moderate" -> MODERATE;
            case "major" -> MAJOR;
            case "critical" -> CRITICAL;
            default -> SAFE;
        };
    }
}
