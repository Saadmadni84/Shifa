package com.shifa.domain.user.dto;

import com.shifa.common.mapper.GlobalMapperConfig;
import com.shifa.domain.user.User;
import org.mapstruct.Mapper;

@Mapper(config = GlobalMapperConfig.class)
public interface UserMapper {
    // Methods for User DTO mapping here
}
