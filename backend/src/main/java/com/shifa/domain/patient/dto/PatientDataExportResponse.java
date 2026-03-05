package com.shifa.domain.patient.dto;

import com.shifa.domain.consent.dto.ConsentResponse;
import com.shifa.domain.notification.dto.NotificationResponse;
import com.shifa.domain.visit.dto.VisitResponse;
import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class PatientDataExportResponse {

    String exportedAt;
    @Builder.Default
    String exportVersion = "1.0";

    PatientResponse personalData;

    List<VisitResponse> visits;

    List<NotificationResponse> notifications;

    List<ConsentResponse> consents;

    @Builder.Default
    String dataController = "Shifa Healthcare Pvt Ltd";
    @Builder.Default
    String privacyPolicyUrl = "https://shifa.health/privacy";
}
