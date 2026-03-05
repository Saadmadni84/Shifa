package com.shifa.domain.visit.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
public class VisitNotesRequest {

    @NotBlank(message = "Notes cannot be empty")
    @Size(min = 20, max = 50000,
          message = "Notes must be at least 20 characters for meaningful AI processing")
    private String rawNotes;

    @Pattern(regexp = "TYPED|VOICE|OCR|IMPORTED",
             message = "Source must be TYPED, VOICE, OCR, or IMPORTED")
    private String notesSource = "TYPED";

    @Size(max = 500)
    private String diagnosis;

    @Future
    private LocalDate followUpDate;

    @Size(max = 1000)
    private String followUpNotes;

    private boolean forceReprocess = false;
}
