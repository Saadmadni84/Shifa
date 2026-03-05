package com.shifa.service.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class VisitCreateRequest {
    private java.util.UUID patientId;
    private LocalDate visitDate;
    private String chiefComplaint;
    private String rawNotes;
    private String vitalSigns;
}
