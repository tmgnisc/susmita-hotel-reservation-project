package com.restaurant;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class RestaurantManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(RestaurantManagementApplication.class, args);
        System.out.println("\n✓ Restaurant Management System is running");
        System.out.println("✓ Server is running on port 8080");
        System.out.println("✓ API available at http://localhost:8080/api");
        System.out.println("✓ Environment: development\n");
    }
}

