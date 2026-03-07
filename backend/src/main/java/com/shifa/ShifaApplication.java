package com.shifa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@ConfigurationPropertiesScan
@EnableAsync
@EnableJpaAuditing
public class ShifaApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShifaApplication.class, args);
    }

}
