package com.microhustle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories("com.microhustle.repository")
public class MicroHustleApplication {
    public static void main(String[] args) {
        SpringApplication.run(MicroHustleApplication.class, args);
    }
}
