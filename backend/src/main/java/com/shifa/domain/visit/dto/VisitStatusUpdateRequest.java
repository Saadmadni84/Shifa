package com.shifa.domain.visit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class VisitStatusUpdateRequest {

    @NotBlank
    @Pattern(regexp = "DRAFT|NOTES_TAKEN|REVIEWED|COMPLETED|CANCELLED",
             message = "Status transition invalid. Cannot set AI_PROCESSING manually.")
    private String status;

    @Size(max = 500)
    private String reason;
}
