package com.shifa.domain.doctor;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Clinic {

    @Column(name = "clinic_name", length = 200)
    private String name;

    @Column(name = "clinic_address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "clinic_city", length = 100)
    private String city;

    @Column(name = "clinic_state", length = 100)
    private String state;

    @Column(name = "clinic_pincode", length = 10)
    private String pincode;

    @Column(name = "clinic_phone", length = 15)
    private String phone;

    @Column(name = "clinic_timing", length = 200)
    private String timing;
}
