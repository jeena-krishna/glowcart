package com.glowcart.backend.mapper;

import com.glowcart.backend.dto.request.ProductRequest;
import com.glowcart.backend.dto.response.ProductResponse;
import com.glowcart.backend.entity.Product;

public class ProductMapper {

    private ProductMapper() {
    }

    public static ProductResponse toResponse(Product product) {
        return toResponse(product, false);
    }

    public static ProductResponse toResponse(Product product, boolean wishlisted) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .brand(product.getBrand())
                .price(product.getPrice())
                .description(product.getDescription())
                .productType(product.getProductType())
                .category(product.getCategory())
                .imageUrl(product.getImageUrl())
                .productLink(product.getProductLink())
                .ingredients(product.getIngredients())
                .stockQuantity(product.getStockQuantity())
                .featured(product.getFeatured())
                .rating(product.getRating())
                .inStock(product.getStockQuantity() != null && product.getStockQuantity() > 0)
                .wishlisted(wishlisted)
                .build();
    }

    public static Product toEntity(ProductRequest request) {
        return Product.builder()
                .name(request.getName())
                .brand(request.getBrand())
                .price(request.getPrice())
                .description(request.getDescription())
                .productType(request.getProductType())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .productLink(request.getProductLink())
                .ingredients(request.getIngredients())
                .stockQuantity(request.getStockQuantity())
                .featured(request.getFeatured() != null ? request.getFeatured() : false)
                .build();
    }

    public static void updateEntity(Product product, ProductRequest request) {
        product.setName(request.getName());
        product.setBrand(request.getBrand());
        product.setPrice(request.getPrice());
        product.setDescription(request.getDescription());
        product.setProductType(request.getProductType());
        product.setCategory(request.getCategory());
        product.setImageUrl(request.getImageUrl());
        product.setProductLink(request.getProductLink());
        product.setIngredients(request.getIngredients());
        product.setStockQuantity(request.getStockQuantity());
        if (request.getFeatured() != null) {
            product.setFeatured(request.getFeatured());
        }
    }
}