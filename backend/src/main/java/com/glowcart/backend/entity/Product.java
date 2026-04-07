package com.glowcart.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_product_category", columnList = "category"),
    @Index(name = "idx_product_brand", columnList = "brand"),
    @Index(name = "idx_product_product_type", columnList = "productType")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Product name is required")
    @Size(max = 255)
    @Column(nullable = false)
    private String name;

    @Size(max = 100)
    private String brand;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Size(max = 100)
    private String productType;

    @Size(max = 100)
    private String category;

    @Column(length = 512)
    private String imageUrl;

    @Column(length = 512)
    private String productLink;

    @Column(columnDefinition = "TEXT")
    private String ingredients;

    @NotNull
    @Column(nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;

    @Builder.Default
    @Column(nullable = false)
    private Boolean featured = false;

    @DecimalMin("0.0")
    @DecimalMax("5.0")
    private BigDecimal rating;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}