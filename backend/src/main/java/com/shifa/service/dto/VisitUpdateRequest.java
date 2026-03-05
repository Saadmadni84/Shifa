package com.shifa.service.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class VisitUpdateRequest {
    private String chiefComplaint;
    private String rawNotes;
    private String diagnosis;
    private LocalDate followUpDate;
}
