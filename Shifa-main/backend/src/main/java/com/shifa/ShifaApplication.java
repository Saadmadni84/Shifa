package com.shifa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ShifaApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShifaApplication.class, args);
    }

}
