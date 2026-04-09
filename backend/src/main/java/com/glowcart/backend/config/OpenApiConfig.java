package com.glowcart.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI glowCartOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("GlowCart API")
                        .description("REST API for GlowCart — a clean beauty e-commerce platform. "
                                + "877+ real beauty products from 40+ brands with JWT authentication, "
                                + "shopping cart, wishlist, and Stripe checkout.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Jeena Mole")
                                .email("jeenak2712@gmail.com")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Token"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Token",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token")));
    }
}