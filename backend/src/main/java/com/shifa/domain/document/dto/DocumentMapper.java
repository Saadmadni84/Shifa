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
    @Mapping(target = "fileName", source = "originalFilename")
    @Mapping(target = "fileType", source = "mimeType")
    @Mapping(target = "fileSize", source = "fileSizeBytes")
    @Mapping(target = "url", source = "s3Key")
    @Mapping(target = "status", source = "ocrStatus")
    @Mapping(target = "ocrProcessed", expression = "java(document.getOcrStatus() == com.shifa.common.enums.OcrStatus.COMPLETE)")
    @Mapping(target = "uploadedAt", source = "createdAt")
    DocumentResponse toResponse(UploadedDocument document);

    List<DocumentResponse> toResponseList(List<UploadedDocument> documents);
}
