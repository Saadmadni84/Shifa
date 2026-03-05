package com.shifa.domain.user.dto;

import com.shifa.common.validation.annotations.IndianPhone;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpSendRequest {

    @NotBlank(message = "Phone number is required")
    @IndianPhone
    private String phoneNumber;

    @Pattern(regexp = "WHATSAPP|SMS", message = "Channel must be WHATSAPP or SMS")
    @Builder.Default
    private String channel = "WHATSAPP";
}
