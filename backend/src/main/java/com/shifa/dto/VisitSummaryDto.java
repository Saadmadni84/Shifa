package com.shifa.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VisitSummaryDto {
    private String id;
    private String patientId;
    private String date;
    private String type;
    private String doctor;
    private String diagnosis;
    private String chiefComplaint;
    private String instructions;
    private VisitDetailDto.WhatsAppSummaryDto whatsappSummary;
    private VisitDetailDto.VitalsDto vitals;
    private String followUpDate;
}
