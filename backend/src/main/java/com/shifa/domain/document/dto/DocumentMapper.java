package com.shifa.domain.document.dto;

import com.shifa.common.mapper.GlobalMapperConfig;
import com.shifa.domain.document.UploadedDocument;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(config = GlobalMapperConfig.class)
public interface DocumentMapper {

    @Mapping(target = "patientId", source = "patient.id")
    @Mapping(target = "visitId", source = "visit.id")
    @Mapping(target = "url", source = "s3Key")
    @Mapping(target = "uploadedAt", source = "createdAt")
    DocumentResponse toResponse(UploadedDocument document);

    List<DocumentResponse> toResponseList(List<UploadedDocument> documents);
}
