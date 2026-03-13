package com.shifa.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PatientSummaryDto {
	private String id;
	private String firstName;
	private String lastName;
	private int age;
	private String dob;
	private String gender;
	private String language;
	private String languageLabel;
	private String phone;
	private String avatar;
	private String alertStatus;
	private int unreadCount;
	private String primaryCondition;
	private String lastVisitDate;
	private String summaryLanguage;
	private String whatsappDeliveryStatus;
	private LastVitals lastVitals;
	private List<ConditionDto> activeConditions;
	private List<MedicationDto> activeMedications;

	@Data
	@Builder
	public static class LastVitals {
		private String bp;
		private String sugar;
		private String weight;
		private String pulse;
	}

	@Data
	@Builder
	public static class ConditionDto {
		private String code;
		private String display;
		private String status;
	}

	@Data
	@Builder
	public static class MedicationDto {
		private String name;
		private String dose;
		private String frequency;
		private String timing;
	}
}
