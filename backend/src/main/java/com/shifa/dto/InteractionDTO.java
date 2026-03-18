package com.shifa.dto;

public class InteractionDTO {
    private boolean hasInteraction;
    private String severity;
    private String message;
    private String management;

    public InteractionDTO() {}

    public InteractionDTO(boolean hasInteraction, String severity, String message, String management) {
        this.hasInteraction = hasInteraction;
        this.severity = severity;
        this.message = message;
        this.management = management;
    }

    public boolean isHasInteraction() {
        return hasInteraction;
    }

    public void setHasInteraction(boolean hasInteraction) {
        this.hasInteraction = hasInteraction;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getManagement() {
        return management;
    }

    public void setManagement(String management) {
        this.management = management;
    }
}
