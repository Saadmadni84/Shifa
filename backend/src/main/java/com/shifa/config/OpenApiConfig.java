package com.shifa.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI shifaOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Shifa API")
                        .version("v1")
                        .description("Shifa Healthcare Platform API"));
    }
}
