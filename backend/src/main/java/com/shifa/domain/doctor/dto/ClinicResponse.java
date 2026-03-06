package com.shifa.domain.doctor.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ClinicResponse {
    String name;
    String address;
    String city;
    String state;
    String pincode;
    String phone;
    String timing;
}
