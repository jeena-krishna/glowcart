package com.glowcart.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private Long id;
    private String name;
    private String brand;
    private BigDecimal price;
    private String description;
    private String productType;
    private String category;
    private String imageUrl;
    private String productLink;
    private String ingredients;
    private Integer stockQuantity;
    private Boolean featured;
    private BigDecimal rating;
    private Boolean inStock;
    private Boolean wishlisted;
}