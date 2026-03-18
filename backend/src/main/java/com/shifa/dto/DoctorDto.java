package com.shifa.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DoctorDto {
	private String id;
	private String name;
	private String specialty;
	private String hospital;
	private String avatar;
	private String phone;
}
